import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, In, IsNull } from 'typeorm';
import { IServiceRequestRepository } from '../interfaces/service-request.repository.interface';
import { ServiceRequestView } from '../entities/service-request-view.entity';
import { GetServiceRequestDto } from '../dto/commands/get-service-request.dto';
import { GetServiceRequestsDto } from '../dto/queries/get-service-requests.dto';
import { SearchServiceRequestsDto } from '../dto/queries/search-service-requests.dto';
import { ServiceRequestResponseDto } from '../dto/responses/service-request-response.dto';
import { GetServiceRequestsResult } from '../dto/responses/service-requests-list-response.dto';
import { Department } from '../../department/entities/department.entity';
import { Room } from '../../room/entities/room.entity';
import { Patient } from '../../patient/entities/patient.entity';
import { Province } from '../../province/entities/province.entity';
import { Ward } from '../../ward/entities/ward.entity';
import { Service as LisService } from '../../service/entities/service.entity';
import { IUnitOfMeasureRepository } from '../../unit-of-measure/interfaces/unit-of-measure.repository.interface';

@Injectable()
export class ServiceRequestService {
    constructor(
        @Inject('IServiceRequestRepository')
        private readonly serviceRequestRepository: IServiceRequestRepository,
        @InjectDataSource('hisConnection')
        private readonly dataSource: DataSource,
        @InjectRepository(Department)
        private readonly departmentRepo: Repository<Department>,
        @InjectRepository(Room)
        private readonly roomRepo: Repository<Room>,
        @InjectRepository(Patient)
        private readonly patientRepo: Repository<Patient>,
        @InjectRepository(Province)
        private readonly provinceRepo: Repository<Province>,
        @InjectRepository(Ward)
        private readonly wardRepo: Repository<Ward>,
        @InjectRepository(LisService)
        private readonly lisServiceRepo: Repository<LisService>,
        @Inject('IUnitOfMeasureRepository')
        private readonly unitOfMeasureRepository: IUnitOfMeasureRepository,
    ) { }

    async getServiceRequestByCode(query: GetServiceRequestDto): Promise<ServiceRequestResponseDto> {
        const { serviceReqCode } = query;

        const serviceRequestData = await this.serviceRequestRepository.findByCodeWithFullDetails(serviceReqCode);

        if (!serviceRequestData || serviceRequestData.length === 0) {
            throw new NotFoundException(`Service request with code ${serviceReqCode} not found`);
        }

        return this.mapServiceRequestToResponseDto(serviceRequestData);
    }

    async getServiceRequests(query: GetServiceRequestsDto): Promise<GetServiceRequestsResult> {
        return this.serviceRequestRepository.findAll(query);
    }

    async searchServiceRequests(query: SearchServiceRequestsDto): Promise<GetServiceRequestsResult> {
        // Convert search query to get query
        const getQuery: GetServiceRequestsDto = {
            limit: query.limit,
            offset: query.offset,
            // no direct serviceReqCode in search dto
            patientCode: query.patientCode,
            fromDate: query.fromDate,
            toDate: query.toDate,
        };

        return this.serviceRequestRepository.findAll(getQuery);
    }

    async getServiceRequestsByPatient(patientCode: string): Promise<ServiceRequestResponseDto[]> {
        const serviceRequestData = await this.serviceRequestRepository.findByPatientCode(patientCode);

        if (!serviceRequestData || serviceRequestData.length === 0) {
            return [];
        }

        // Group by service request ID
        const groupedData = this.groupServiceRequestsByCode(serviceRequestData);

        return Promise.all(Object.values(groupedData).map(data => this.mapServiceRequestToResponseDto(data)));
    }

    async getServiceRequestsByDateRange(fromDate: number, toDate: number): Promise<ServiceRequestResponseDto[]> {
        const serviceRequestData = await this.serviceRequestRepository.findByDateRange(fromDate, toDate);

        if (!serviceRequestData || serviceRequestData.length === 0) {
            return [];
        }

        // Group by service request ID
        const groupedData = this.groupServiceRequestsByCode(serviceRequestData);

        return Promise.all(Object.values(groupedData).map(data => this.mapServiceRequestToResponseDto(data)));
    }

    async getStatistics(): Promise<any> {
        return this.serviceRequestRepository.getStatistics();
    }

    private groupServiceRequestsByCode(serviceRequestData: ServiceRequestView[]): { [key: string]: ServiceRequestView[] } {
        const grouped: { [key: string]: ServiceRequestView[] } = {};

        serviceRequestData.forEach(item => {
            const key = item.serviceReqCode;
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(item);
        });

        return grouped;
    }

    private async mapServiceRequestToResponseDto(serviceRequestData: ServiceRequestView[]): Promise<ServiceRequestResponseDto> {
        const firstItem = serviceRequestData[0];

        // Group services by HIS_SERE_SERV_ID
        const servicesMap = new Map<number, ServiceRequestView[]>();
        serviceRequestData.forEach(item => {
            if (!servicesMap.has(item.hisSereServId)) {
                servicesMap.set(item.hisSereServId, []);
            }
            servicesMap.get(item.hisSereServId)!.push(item);
        });

        // Prepare LIS parent service mapping by SERVICE_CODE (PARENT_SERVICE_ID IS NULL)
        const serviceCodes = Array.from(servicesMap.values()).map(g => g[0].serviceCode);
        const uniqueCodes = Array.from(new Set(serviceCodes)).filter(Boolean);

        let lisParentMap = new Map<string, { id: string; unitOfMeasureId: string | null; mapping: string | null; numOrder: number }>();
        if (uniqueCodes.length > 0) {
            const lisParents = await this.lisServiceRepo.find({
                where: { serviceCode: In(uniqueCodes), parentServiceId: IsNull() },
                select: ['id', 'serviceCode', 'unitOfMeasureId', 'mapping', 'numOrder'],
            });
            lisParentMap = new Map(lisParents.map(x => [x.serviceCode, {
                id: x.id,
                unitOfMeasureId: (x as any).unitOfMeasureId ?? null,
                mapping: (x as any).mapping ?? null,
                numOrder: (x as any).numOrder ?? 0,
            }]));
        }

        // First pass: compute summary with potential lisServiceId per HIS group
        const serviceSummaries = Array.from(servicesMap.values()).map(group => {
            const first = group[0];
            const lisParentInfo = first.serviceCode ? (lisParentMap.get(first.serviceCode) ?? null) : null;
            const lisServiceId = lisParentInfo?.id ?? null;
            const parentUnitOfMeasureId = lisParentInfo?.unitOfMeasureId ?? null;
            const parentMapping = lisParentInfo?.mapping ?? null;
            const parentNumOrder = lisParentInfo?.numOrder ?? null;
            return { first, group, lisServiceId, parentUnitOfMeasureId, parentMapping, parentNumOrder };
        });

        // Fetch all LIS children for matched lisServiceIds in one query
        const parentIds = Array.from(new Set(serviceSummaries.map(s => s.lisServiceId).filter((v): v is string => !!v)));
        let childrenByParent = new Map<string, { id: string; serviceCode: string; serviceName: string; currentPrice: number | null; shortName?: string | null; unitOfMeasureId: string | null }[]>();
        if (parentIds.length > 0) {
            const children = await this.lisServiceRepo.find({
                where: { parentServiceId: In(parentIds) },
                select: ['id', 'serviceCode', 'serviceName', 'currentPrice', 'parentServiceId', 'shortName', 'unitOfMeasureId'],
            });
            childrenByParent = children.reduce((acc, c) => {
                const arr = acc.get(c.parentServiceId as unknown as string) || [];
                arr.push({
                    id: c.id,
                    serviceCode: c.serviceCode,
                    serviceName: c.serviceName,
                    currentPrice: (c as any).currentPrice ?? null,
                    shortName: (c as any).shortName ?? null,
                    unitOfMeasureId: (c as any).unitOfMeasureId ?? null,
                });
                acc.set(c.parentServiceId as unknown as string, arr);
                return acc;
            }, new Map<string, any[]>());
        }

        // Collect all unitOfMeasureIds for batch lookup
        const allUnitOfMeasureIds = new Set<string>();
        serviceSummaries.forEach(s => {
            if (s.parentUnitOfMeasureId) {
                allUnitOfMeasureIds.add(s.parentUnitOfMeasureId);
            }
            const lisChildren = s.lisServiceId ? (childrenByParent.get(s.lisServiceId) || []) : [];
            lisChildren.forEach(ch => {
                if (ch.unitOfMeasureId) {
                    allUnitOfMeasureIds.add(ch.unitOfMeasureId);
                }
            });
        });

        // Batch lookup UnitOfMeasure
        const unitOfMeasures = await this.unitOfMeasureRepository.findByIds(Array.from(allUnitOfMeasureIds));
        const unitOfMeasureMap = new Map(unitOfMeasures.map(uom => [uom.id, uom]));

        // Build final services, preferring LIS children for serviceTests when available
        const services = serviceSummaries.map(s => {
            const { first, group, lisServiceId, parentUnitOfMeasureId, parentMapping, parentNumOrder } = s;
            const lisChildren = lisServiceId ? (childrenByParent.get(lisServiceId) || []) : [];

            const parentUom = parentUnitOfMeasureId ? unitOfMeasureMap.get(parentUnitOfMeasureId) : null;

            const serviceTests = lisChildren.length > 0
                ? lisChildren.map(ch => {
                    const childUom = ch.unitOfMeasureId ? unitOfMeasureMap.get(ch.unitOfMeasureId) : null;
                    return {
                        id: ch.id,
                        testCode: ch.serviceCode,
                        testName: ch.serviceName,
                        shortName: ch.shortName ?? null,
                        description: null,
                        unitOfMeasureId: ch.unitOfMeasureId ?? null,
                        unitOfMeasureCode: childUom?.unitOfMeasureCode ?? null,
                        unitOfMeasureName: childUom?.unitOfMeasureName ?? null,
                        rangeText: null,
                        rangeLow: null,
                        rangeHigh: null,
                        mapping: null,
                        testOrder: 0,
                        price: ch.currentPrice ?? 0,
                        isActive: 1,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        createdBy: 'system',
                        updatedBy: 'system',
                        version: 1,
                    };
                })
                : undefined;

            const result: any = {
                hisSereServId: first.hisSereServId,
                serviceId: first.serviceId,
                serviceCode: first.serviceCode,
                serviceName: first.serviceName,
                price: first.price,
                lisServiceId,
                unitOfMeasureId: parentUnitOfMeasureId ?? null,
                unitOfMeasureCode: parentUom?.unitOfMeasureCode ?? null,
                unitOfMeasureName: parentUom?.unitOfMeasureName ?? null,
                rangeText: null,
                rangeLow: null,
                rangeHigh: null,
                mapping: parentMapping ?? null,
                testOrder: parentNumOrder ?? null,
            };
            if (serviceTests && serviceTests.length > 0) {
                result.serviceTests = serviceTests;
            }
            return result;
        });

        // Lookup LIS Department & Room IDs by codes
        const [reqDept, exeDept, reqRoom, exeRoom, lisPatient, lisProvince, lisWard] = await Promise.all([
            firstItem.requestDepartmentCode
                ? this.departmentRepo.findOne({ where: { departmentCode: firstItem.requestDepartmentCode } })
                : Promise.resolve(null),
            firstItem.executeDepartmentCode
                ? this.departmentRepo.findOne({ where: { departmentCode: firstItem.executeDepartmentCode } })
                : Promise.resolve(null),
            firstItem.requestRoomCode
                ? this.roomRepo.findOne({ where: { roomCode: firstItem.requestRoomCode } })
                : Promise.resolve(null),
            firstItem.executeRoomCode
                ? this.roomRepo.findOne({ where: { roomCode: firstItem.executeRoomCode } })
                : Promise.resolve(null),
            firstItem.patientCode
                ? this.patientRepo.findOne({ where: { patientCode: firstItem.patientCode } })
                : Promise.resolve(null),
            firstItem.patientProvinceCode
                ? this.provinceRepo.findOne({ where: { provinceCode: firstItem.patientProvinceCode } })
                : Promise.resolve(null),
            firstItem.patientCommuneCode
                ? this.wardRepo.findOne({ where: { wardCode: firstItem.patientCommuneCode } })
                : Promise.resolve(null),
        ]);

        return {
            id: firstItem.id,
            serviceReqCode: firstItem.serviceReqCode,
            serviceReqSttId: firstItem.serviceReqSttId,
            serviceReqSttCode: firstItem.serviceReqSttCode,
            serviceReqTypeId: firstItem.serviceReqTypeId,
            serviceReqTypeCode: firstItem.serviceReqTypeCode,
            instructionTime: firstItem.instructionTime,
            instructionDate: firstItem.instructionDate,
            icdCode: firstItem.icdCode,
            icdName: firstItem.icdName,
            icdSubCode: firstItem.icdSubCode,
            icdText: firstItem.icdText,
            treatmentId: firstItem.treatmentId,
            treatmentCode: firstItem.treatmentCode,
            note: firstItem.note,
            requestRoom: {
                id: firstItem.requestRoomId,
                code: firstItem.requestRoomCode,
                name: firstItem.requestRoomName,
                lisRoomId: reqRoom?.id ?? null,
            },
            requestDepartment: {
                id: firstItem.requestDepartmentId,
                code: firstItem.requestDepartmentCode,
                name: firstItem.requestDepartmentName,
                lisDepartmentId: reqDept?.id ?? null,
            },
            executeRoom: {
                id: firstItem.executeRoomId,
                code: firstItem.executeRoomCode,
                name: firstItem.executeRoomName,
                lisRoomId: exeRoom?.id ?? null,
            },
            executeDepartment: {
                id: firstItem.executeDepartmentId,
                code: firstItem.executeDepartmentCode,
                name: firstItem.executeDepartmentName,
                lisDepartmentId: exeDept?.id ?? null,
            },
            patient: {
                id: firstItem.patientId,
                code: firstItem.patientCode,
                name: firstItem.patientName,
                dob: firstItem.patientDob,
                cmndNumber: firstItem.patientCmndNumber,
                cmndDate: firstItem.patientCmndDate,
                cmndPlace: firstItem.patientCmndPlace,
                mobile: firstItem.patientMobile,
                phone: firstItem.patientPhone,
                provinceCode: firstItem.patientProvinceCode,
                provinceName: firstItem.patientProvinceName,
                lisProvinceId: lisProvince?.id ?? null,
                communeCode: firstItem.patientCommuneCode,
                communeName: firstItem.patientCommuneName,
                lisWardId: lisWard?.id ?? null,
                address: firstItem.patientAddress,
                genderId: firstItem.patientGenderId,
                genderName: firstItem.patientGenderName,
                careerName: firstItem.patientCareerName,
                lisPatientId: lisPatient?.id ?? null,
            },
            services,
            // metadata omitted in HIS view mapping
        };
    }
}