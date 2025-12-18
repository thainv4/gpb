import { Injectable, Inject, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IStoredServiceRequestRepository } from '../interfaces/stored-service-request.repository.interface';
import { IStoredServiceRequestServiceRepository } from '../interfaces/stored-service-request-service.repository.interface';
import { ServiceRequestService } from './service-request.service';
import { StoreServiceRequestDto } from '../dto/commands/store-service-request.dto';
import { EnterResultDto } from '../dto/commands/enter-result.dto';
import { ReviewResultDto } from '../dto/commands/review-result.dto';
import { ApproveResultDto } from '../dto/commands/approve-result.dto';
import { QcResultDto } from '../dto/commands/qc-result.dto';
import { StoredServiceRequestResponseDto } from '../dto/responses/stored-service-request-response.dto';
import { StoredServiceRequestDetailResponseDto, StoredServiceResponseDto, WorkflowCurrentStateDto } from '../dto/responses/stored-service-request-detail-response.dto';
import { CurrentUser } from '../../../common/interfaces/current-user.interface';
import { StoredServiceRequest } from '../entities/stored-service-request.entity';
import { StoredServiceRequestService as StoredServiceRequestServiceEntity } from '../entities/stored-service-request-service.entity';
import { WorkflowHistoryService } from '../../workflow/workflow-history/services/workflow-history.service';
import { IWorkflowStateRepository } from '../../workflow/interfaces/workflow-state.repository.interface';
import { StartWorkflowDto } from '../../workflow/workflow-history/dto/commands/start-workflow.dto';

@Injectable()
export class StoredServiceRequestService {
    constructor(
        @Inject('IStoredServiceRequestRepository')
        private readonly storedRepo: IStoredServiceRequestRepository,
        @Inject('IStoredServiceRequestServiceRepository')
        private readonly serviceRepo: IStoredServiceRequestServiceRepository,
        private readonly serviceRequestService: ServiceRequestService,
        private readonly workflowHistoryService: WorkflowHistoryService,
        @Inject('IWorkflowStateRepository')
        private readonly workflowStateRepo: IWorkflowStateRepository,
        private readonly dataSource: DataSource,
    ) { }

    async storeServiceRequest(
        dto: StoreServiceRequestDto,
        currentUser: CurrentUser
    ): Promise<StoredServiceRequestResponseDto> {
        return this.dataSource.transaction(async (manager) => {
            // 1. Kiểm tra đã tồn tại chưa
            const existing = await this.storedRepo.findByServiceReqCode(dto.serviceReqCode);
            if (existing) {
                throw new ConflictException(
                    `Service Request ${dto.serviceReqCode} đã được lưu trữ`
                );
            }

            // 2. Lấy dữ liệu từ API service-requests/code
            const enrichedData = await this.serviceRequestService.getServiceRequestByCode({
                serviceReqCode: dto.serviceReqCode
            });

            // 3. Lưu StoredServiceRequest
            const storedRequest = new StoredServiceRequest();
            storedRequest.hisServiceReqCode = enrichedData.serviceReqCode;
            storedRequest.hisServiceReqId = enrichedData.id;
            storedRequest.serviceReqCode = enrichedData.serviceReqCode;
            storedRequest.serviceReqSttId = enrichedData.serviceReqSttId;
            storedRequest.serviceReqSttCode = enrichedData.serviceReqSttCode;
            storedRequest.serviceReqTypeId = enrichedData.serviceReqTypeId;
            storedRequest.serviceReqTypeCode = enrichedData.serviceReqTypeCode;
            storedRequest.instructionTime = enrichedData.instructionTime;
            storedRequest.instructionDate = enrichedData.instructionDate;
            storedRequest.icdCode = enrichedData.icdCode ?? null;
            storedRequest.icdName = enrichedData.icdName ?? null;
            storedRequest.icdSubCode = enrichedData.icdSubCode ?? null;
            storedRequest.icdText = enrichedData.icdText ?? null;
            storedRequest.treatmentId = enrichedData.treatmentId;
            storedRequest.treatmentCode = enrichedData.treatmentCode;
            storedRequest.note = enrichedData.note ?? null;

            // Request Location
            storedRequest.requestRoomId = enrichedData.requestRoom.id ?? null;
            storedRequest.requestRoomCode = enrichedData.requestRoom.code ?? null;
            storedRequest.requestRoomName = enrichedData.requestRoom.name ?? null;
            storedRequest.requestRoomLisId = enrichedData.requestRoom.lisRoomId ?? null;
            storedRequest.requestDepartmentId = enrichedData.requestDepartment.id ?? null;
            storedRequest.requestDepartmentCode = enrichedData.requestDepartment.code ?? null;
            storedRequest.requestDepartmentName = enrichedData.requestDepartment.name ?? null;
            storedRequest.requestDepartmentLisId = enrichedData.requestDepartment.lisDepartmentId ?? null;

            // Execute Location
            storedRequest.executeRoomId = enrichedData.executeRoom.id ?? null;
            storedRequest.executeRoomCode = enrichedData.executeRoom.code ?? null;
            storedRequest.executeRoomName = enrichedData.executeRoom.name ?? null;
            storedRequest.executeRoomLisId = enrichedData.executeRoom.lisRoomId ?? null;
            storedRequest.executeDepartmentId = enrichedData.executeDepartment.id ?? null;
            storedRequest.executeDepartmentCode = enrichedData.executeDepartment.code ?? null;
            storedRequest.executeDepartmentName = enrichedData.executeDepartment.name ?? null;
            storedRequest.executeDepartmentLisId = enrichedData.executeDepartment.lisDepartmentId ?? null;

            // Patient Info
            storedRequest.patientId = enrichedData.patient.id ?? null;
            storedRequest.patientCode = enrichedData.patient.code ?? null;
            storedRequest.patientName = enrichedData.patient.name ?? null;
            storedRequest.patientDob = enrichedData.patient.dob ?? null;
            storedRequest.patientCmndNumber = enrichedData.patient.cmndNumber ?? null;
            storedRequest.patientCmndDate = enrichedData.patient.cmndDate ?? null;
            storedRequest.patientCmndPlace = enrichedData.patient.cmndPlace ?? null;
            storedRequest.patientMobile = enrichedData.patient.mobile ?? null;
            storedRequest.patientPhone = enrichedData.patient.phone ?? null;
            storedRequest.patientProvinceCode = enrichedData.patient.provinceCode ?? null;
            storedRequest.patientProvinceName = enrichedData.patient.provinceName ?? null;
            storedRequest.patientProvinceLisId = enrichedData.patient.lisProvinceId ?? null;
            storedRequest.patientCommuneCode = enrichedData.patient.communeCode ?? null;
            storedRequest.patientCommuneName = enrichedData.patient.communeName ?? null;
            storedRequest.patientCommuneLisId = enrichedData.patient.lisWardId ?? null;
            storedRequest.patientAddress = enrichedData.patient.address ?? null;
            storedRequest.patientGenderId = enrichedData.patient.genderId ?? null;
            storedRequest.patientGenderName = enrichedData.patient.genderName ?? null;
            storedRequest.patientCareerName = enrichedData.patient.careerName ?? null;
            storedRequest.patientLisId = enrichedData.patient.lisPatientId ?? null;

            // Context When Storing (NEW)
            storedRequest.currentRoomId = dto.currentRoomId;
            storedRequest.currentDepartmentId = dto.currentDepartmentId;

            // Metadata
            if (dto.saveRawJson) {
                storedRequest.rawResponseJson = JSON.stringify(enrichedData);
            }
            storedRequest.storedAt = new Date();
            storedRequest.storedBy = currentUser.username || currentUser.id;
            storedRequest.createdBy = currentUser.id;
            storedRequest.updatedBy = currentUser.id;

            const savedRequest = await manager.save(StoredServiceRequest, storedRequest);

            // 4. Lưu Services (parents và children)
            let servicesCount = 0;
            for (const service of enrichedData.services) {
                // 4.1. Lưu parent service
                const storedService = new StoredServiceRequestServiceEntity();
                storedService.storedServiceRequestId = savedRequest.id;
                storedService.parentServiceId = null;
                storedService.isChildService = 0;
                storedService.hisSereServId = service.hisSereServId;
                storedService.serviceId = service.serviceId;
                storedService.serviceCode = service.serviceCode;
                storedService.serviceName = service.serviceName;
                storedService.price = service.price;
                storedService.lisServiceId = service.lisServiceId ?? null;
                storedService.unitOfMeasureId = service.unitOfMeasureId ?? null;
                storedService.unitOfMeasureCode = service.unitOfMeasureCode ?? null;
                storedService.unitOfMeasureName = service.unitOfMeasureName ?? null;
                storedService.rangeText = service.rangeText ?? null;
                storedService.rangeLow = service.rangeLow ?? null;
                storedService.rangeHigh = service.rangeHigh ?? null;
                storedService.mapping = service.mapping ?? null;
                storedService.testOrder = service.testOrder ?? null;
                storedService.resultText = null; // Để trống, sẽ update sau

                // Sample Collection Info (NEW)
                storedService.receptionCode = dto.receptionCode;
                storedService.sampleCollectionTime = new Date(dto.sampleCollectionTime);
                storedService.collectedByUserId = dto.collectedByUserId ?? null;

                storedService.createdBy = currentUser.id;
                storedService.updatedBy = currentUser.id;

                const savedService = await manager.save(StoredServiceRequestServiceEntity, storedService);
                servicesCount++;

                // 4.2. Lưu serviceTests (children)
                if (service.serviceTests && service.serviceTests.length > 0) {
                    for (const test of service.serviceTests) {
                        const storedTest = new StoredServiceRequestServiceEntity();
                        storedTest.storedServiceRequestId = savedRequest.id;
                        storedTest.parentServiceId = savedService.id; // Link to parent
                        storedTest.isChildService = 1;
                        storedTest.testId = test.id;
                        storedTest.serviceCode = test.testCode;
                        storedTest.serviceName = test.testName;
                        storedTest.shortName = test.shortName ?? null;
                        storedTest.description = test.description ?? null;
                        storedTest.unitOfMeasureId = test.unitOfMeasureId ?? null;
                        storedTest.unitOfMeasureCode = test.unitOfMeasureCode ?? null;
                        storedTest.unitOfMeasureName = test.unitOfMeasureName ?? null;
                        storedTest.rangeText = test.rangeText ?? null;
                        storedTest.rangeLow = test.rangeLow ?? null;
                        storedTest.rangeHigh = test.rangeHigh ?? null;
                        storedTest.mapping = test.mapping ?? null;
                        storedTest.testOrder = test.testOrder ?? 0;
                        storedTest.price = test.price ?? 0;
                        storedTest.isActive = test.isActive ?? 1;
                        storedTest.resultText = null; // Để trống, sẽ update sau
                        storedTest.testCreatedAt = test.createdAt;
                        storedTest.testUpdatedAt = test.updatedAt;
                        storedTest.testCreatedBy = test.createdBy ?? null;
                        storedTest.testUpdatedBy = test.updatedBy ?? null;
                        storedTest.testVersion = test.version;

                        // Sample Collection Info (NEW) - same as parent
                        storedTest.receptionCode = dto.receptionCode;
                        storedTest.sampleCollectionTime = new Date(dto.sampleCollectionTime);
                        storedTest.collectedByUserId = dto.collectedByUserId ?? null;

                        storedTest.createdBy = currentUser.id;
                        storedTest.updatedBy = currentUser.id;

                        await manager.save(StoredServiceRequestServiceEntity, storedTest);
                    }
                }
            }

            // 5. TỰ ĐỘNG START WORKFLOW (Bước 1 của workflow = SAMPLE_COLLECTION)
            let workflowStarted = false;
            try {
                // 5.1. Lấy first workflow state (SAMPLE_COLLECTION - Bước 1)
                const firstState = await this.workflowStateRepo.getFirstState();

                if (!firstState) {
                    console.warn('Không tìm thấy workflow state đầu tiên, bỏ qua auto-start workflow');
                } else {
                    // 5.2. Tạo StartWorkflowDto với đầy đủ thông tin từ enrichedData và currentUser
                    const startWorkflowDto: StartWorkflowDto = {
                        // Lấy từ savedRequest.id (vừa lưu xong)
                        storedServiceReqId: savedRequest.id,

                        // NULL = áp dụng cho toàn bộ Service Request (không chỉ cho 1 service cụ thể)
                        storedServiceId: null,

                        // Lấy từ firstState.id (query từ database)
                        toStateId: firstState.id,

                        // Lấy từ currentUser.id (JWT token trong request)
                        currentUserId: currentUser.id,

                        // Lấy từ enrichedData.executeDepartment.lisDepartmentId (đã enrich từ LIS)
                        // Nếu không có LIS mapping → null (vẫn start được workflow)
                        currentDepartmentId: enrichedData.executeDepartment.lisDepartmentId ?? dto.currentDepartmentId,

                        // Lấy từ enrichedData.executeRoom.lisRoomId (đã enrich từ LIS)
                        // Nếu không có LIS mapping → null (vẫn start được workflow)
                        currentRoomId: enrichedData.executeRoom.lisRoomId ?? dto.currentRoomId,

                        // Auto-generated notes
                        notes: `Workflow tự động bắt đầu khi lưu Service Request ${dto.serviceReqCode}`,
                    };

                    // 5.3. Start workflow (trong cùng transaction)
                    await this.workflowHistoryService.startWorkflow(startWorkflowDto, currentUser);
                    workflowStarted = true;
                }
            } catch (error) {
                // Log error nhưng không throw để không rollback toàn bộ transaction
                // Workflow có thể start sau bằng API riêng nếu cần
                console.error('Failed to auto-start workflow:', error);
                // Có thể thêm notification/logging ở đây
            }

            return {
                id: savedRequest.id,
                serviceReqCode: savedRequest.serviceReqCode,
                servicesCount,
                storedAt: savedRequest.storedAt,
                workflowStarted,
            };
        });
    }

    /**
     * Lấy chi tiết Service Request đã lưu theo ID
     */
    async getStoredServiceRequestById(id: string): Promise<StoredServiceRequestDetailResponseDto> {
        // Load với relations
        const storedRequest = await this.storedRepo.findByIdWithRelations(id);

        if (!storedRequest) {
            throw new NotFoundException(`Stored Service Request với ID ${id} không tìm thấy`);
        }

        // Load workflow current state
        let workflowCurrentState: WorkflowCurrentStateDto | null = null;
        try {
            const currentState = await this.workflowHistoryService.getCurrentState(storedRequest.id, null);
            if (currentState) {
                // Get state info from WorkflowState if needed
                let stateCode: string | undefined;
                let stateName: string | undefined;
                if (currentState.toStateId) {
                    try {
                        const state = await this.workflowStateRepo.findById(currentState.toStateId);
                        if (state) {
                            stateCode = state.stateCode;
                            stateName = state.stateName;
                        }
                    } catch (error) {
                        // Ignore
                    }
                }

                workflowCurrentState = {
                    id: currentState.id,
                    toStateId: currentState.toStateId,
                    stateCode,
                    stateName,
                    actionType: currentState.actionType,
                    startedAt: currentState.startedAt,
                    actionTimestamp: currentState.actionTimestamp,
                    completedAt: currentState.completedAt,
                    isCurrent: currentState.isCurrent,
                    notes: currentState.notes,
                };
            }
        } catch (error) {
            // Ignore workflow errors, just log
            console.warn('Failed to load workflow current state:', error);
        }

        // Map services (parent + children)
        const servicesMap = new Map<string, StoredServiceResponseDto>();

        // First pass: Map all services
        storedRequest.services?.forEach((service) => {
            if (service.isChildService === 0) {
                // Parent service
                servicesMap.set(service.id, this.mapServiceToDto(service));
            }
        });

        // Second pass: Add children to parents
        storedRequest.services?.forEach((service) => {
            if (service.isChildService === 1 && service.parentServiceId) {
                const parent = servicesMap.get(service.parentServiceId);
                if (parent) {
                    if (!parent.serviceTests) {
                        parent.serviceTests = [];
                    }
                    parent.serviceTests.push(this.mapServiceToDto(service));
                }
            }
        });

        // Convert map to array (only parent services)
        const services = Array.from(servicesMap.values());

        // Map to response DTO
        return {
            id: storedRequest.id,
            hisServiceReqCode: storedRequest.hisServiceReqCode,
            hisServiceReqId: storedRequest.hisServiceReqId,
            serviceReqCode: storedRequest.serviceReqCode,
            serviceReqSttId: storedRequest.serviceReqSttId,
            serviceReqSttCode: storedRequest.serviceReqSttCode,
            serviceReqTypeId: storedRequest.serviceReqTypeId,
            serviceReqTypeCode: storedRequest.serviceReqTypeCode,
            instructionTime: storedRequest.instructionTime,
            instructionDate: storedRequest.instructionDate,
            icdCode: storedRequest.icdCode,
            icdName: storedRequest.icdName,
            icdSubCode: storedRequest.icdSubCode,
            icdText: storedRequest.icdText,
            treatmentId: storedRequest.treatmentId,
            treatmentCode: storedRequest.treatmentCode,
            note: storedRequest.note,
            requestRoomId: storedRequest.requestRoomId?.toString(),
            requestRoomCode: storedRequest.requestRoomCode,
            requestRoomName: storedRequest.requestRoomName,
            requestRoomLisId: storedRequest.requestRoomLisId,
            requestDepartmentId: storedRequest.requestDepartmentId?.toString(),
            requestDepartmentCode: storedRequest.requestDepartmentCode,
            requestDepartmentName: storedRequest.requestDepartmentName,
            requestDepartmentLisId: storedRequest.requestDepartmentLisId,
            executeRoomId: storedRequest.executeRoomId?.toString(),
            executeRoomCode: storedRequest.executeRoomCode,
            executeRoomName: storedRequest.executeRoomName,
            executeRoomLisId: storedRequest.executeRoomLisId,
            executeDepartmentId: storedRequest.executeDepartmentId?.toString(),
            executeDepartmentCode: storedRequest.executeDepartmentCode,
            executeDepartmentName: storedRequest.executeDepartmentName,
            executeDepartmentLisId: storedRequest.executeDepartmentLisId,
            currentRoomId: storedRequest.currentRoomId,
            currentDepartmentId: storedRequest.currentDepartmentId,
            patientId: storedRequest.patientId?.toString(),
            patientCode: storedRequest.patientCode,
            patientName: storedRequest.patientName,
            patientDob: storedRequest.patientDob,
            patientCmndNumber: storedRequest.patientCmndNumber,
            patientCmndDate: storedRequest.patientCmndDate,
            patientCmndPlace: storedRequest.patientCmndPlace,
            patientMobile: storedRequest.patientMobile,
            patientPhone: storedRequest.patientPhone,
            patientProvinceCode: storedRequest.patientProvinceCode,
            patientProvinceName: storedRequest.patientProvinceName,
            patientProvinceLisId: storedRequest.patientProvinceLisId,
            patientCommuneCode: storedRequest.patientCommuneCode,
            patientCommuneName: storedRequest.patientCommuneName,
            patientCommuneLisId: storedRequest.patientCommuneLisId,
            patientAddress: storedRequest.patientAddress,
            patientGenderId: storedRequest.patientGenderId,
            patientGenderName: storedRequest.patientGenderName,
            patientCareerName: storedRequest.patientCareerName,
            patientLisId: storedRequest.patientLisId,
            storedAt: storedRequest.storedAt,
            storedBy: storedRequest.storedBy,
            rawResponseJson: storedRequest.rawResponseJson,
            services,
            workflowCurrentState,
            createdAt: storedRequest.createdAt,
            updatedAt: storedRequest.updatedAt,
            deletedAt: storedRequest.deletedAt,
        };
    }

    /**
     * Lấy chi tiết Service/Test đã lưu theo ID
     */
    async getStoredServiceById(serviceId: string): Promise<StoredServiceResponseDto> {
        const service = await this.serviceRepo.findById(serviceId);
        
        if (!service) {
            throw new NotFoundException(`Stored Service với ID ${serviceId} không tìm thấy`);
        }
        
        // Load children nếu là parent service
        if (service.isChildService === 0) {
            const children = await this.serviceRepo.findByParentServiceId(serviceId);
            service.children = children;
        }
        
        return this.mapServiceToDto(service);
    }

    /**
     * Map Service Entity to DTO
     */
    private mapServiceToDto(service: StoredServiceRequestServiceEntity): StoredServiceResponseDto {
        return {
            id: service.id,
            parentServiceId: service.parentServiceId,
            isChildService: service.isChildService,
            hisSereServId: service.hisSereServId,
            serviceId: service.serviceId,
            serviceCode: service.serviceCode,
            serviceName: service.serviceName,
            price: service.price,
            lisServiceId: service.lisServiceId,
            unitOfMeasureId: service.unitOfMeasureId,
            unitOfMeasureCode: service.unitOfMeasureCode,
            unitOfMeasureName: service.unitOfMeasureName,
            rangeText: service.rangeText,
            rangeLow: service.rangeLow,
            rangeHigh: service.rangeHigh,
            mapping: service.mapping,
            testOrder: service.testOrder,
            shortName: service.shortName,
            description: service.description,
            resultText: service.resultText,
            resultValue: service.resultValue,
            resultValueText: service.resultValueText,
            resultStatus: service.resultStatus,
            isNormal: service.isNormal,
            resultEnteredAt: service.resultEnteredAt,
            resultReviewedAt: service.resultReviewedAt,
            resultApprovedAt: service.resultApprovedAt,
            resultCompletedAt: service.resultCompletedAt,
            resultEnteredByUserId: service.resultEnteredByUserId,
            resultReviewedByUserId: service.resultReviewedByUserId,
            resultApprovedByUserId: service.resultApprovedByUserId,
            resultNotes: service.resultNotes,
            resultMetadata: service.resultMetadata,
            qcStatus: service.qcStatus,
            qcCheckedByUserId: service.qcCheckedByUserId,
            qcCheckedAt: service.qcCheckedAt,
            receptionCode: service.receptionCode,
            sampleCollectionTime: service.sampleCollectionTime,
            collectedByUserId: service.collectedByUserId,
            documentId: service.documentId,
            testId: service.testId,
            isActive: service.isActive,
            serviceTests: service.isChildService === 0 && service.children?.length > 0
                ? service.children.map(child => this.mapServiceToDto(child))
                : undefined,
        };
    }

    /**
     * Nhập/cập nhật kết quả xét nghiệm
     */
    async enterResult(
        storedReqId: string,
        serviceId: string,
        dto: EnterResultDto,
        currentUser: CurrentUser
    ): Promise<{ id: string; resultEnteredAt: Date; resultEnteredByUserId: string }> {
        return this.dataSource.transaction(async (manager) => {
            // Validate stored request exists
            const storedRequest = await this.storedRepo.findById(storedReqId);
            if (!storedRequest) {
                throw new NotFoundException(`Stored Service Request với ID ${storedReqId} không tìm thấy`);
            }

            // Find service
            const service = await this.serviceRepo.findById(serviceId);
            if (!service) {
                throw new NotFoundException(`Service với ID ${serviceId} không tìm thấy`);
            }

            // Validate service belongs to stored request
            if (service.storedServiceRequestId !== storedReqId) {
                throw new BadRequestException('Service không thuộc Service Request này');
            }

            // Update result fields
            if (dto.resultValue !== undefined) {
                service.resultValue = dto.resultValue;
            }
            if (dto.resultValueText !== undefined) {
                service.resultValueText = dto.resultValueText;
            }
            if (dto.resultText !== undefined) {
                service.resultText = dto.resultText;
            }
            service.resultStatus = dto.resultStatus;

            // Auto-calculate IS_NORMAL
            if (dto.resultStatus === 'NORMAL') {
                service.isNormal = 1;
            } else if (dto.resultStatus === 'ABNORMAL' || dto.resultStatus === 'CRITICAL') {
                service.isNormal = 0;
            } else {
                service.isNormal = null;
            }

            // Check range if resultValue is provided
            if (dto.resultValue !== undefined && service.rangeLow !== null && service.rangeHigh !== null) {
                if (dto.resultValue >= service.rangeLow && dto.resultValue <= service.rangeHigh) {
                    service.isNormal = 1;
                } else {
                    service.isNormal = 0;
                }
            }

            if (dto.resultNotes !== undefined) {
                service.resultNotes = dto.resultNotes;
            }
            if (dto.resultMetadata !== undefined) {
                service.resultMetadata = dto.resultMetadata;
            }

            // Set audit fields
            service.resultEnteredAt = new Date();
            service.resultEnteredByUserId = currentUser.id;
            service.updatedBy = currentUser.id;

            const savedService = await manager.save(StoredServiceRequestServiceEntity, service);

            return {
                id: savedService.id,
                resultEnteredAt: savedService.resultEnteredAt!,
                resultEnteredByUserId: savedService.resultEnteredByUserId!,
            };
        });
    }

    /**
     * Review kết quả
     */
    async reviewResult(
        storedReqId: string,
        serviceId: string,
        dto: ReviewResultDto,
        currentUser: CurrentUser
    ): Promise<{ id: string; resultReviewedAt: Date; resultReviewedByUserId: string }> {
        return this.dataSource.transaction(async (manager) => {
            // Validate stored request exists
            const storedRequest = await this.storedRepo.findById(storedReqId);
            if (!storedRequest) {
                throw new NotFoundException(`Stored Service Request với ID ${storedReqId} không tìm thấy`);
            }

            // Find service
            const service = await this.serviceRepo.findById(serviceId);
            if (!service) {
                throw new NotFoundException(`Service với ID ${serviceId} không tìm thấy`);
            }

            // Validate service belongs to stored request
            if (service.storedServiceRequestId !== storedReqId) {
                throw new BadRequestException('Service không thuộc Service Request này');
            }

            // Check if result has been entered
            if (!service.resultEnteredAt) {
                throw new BadRequestException('Kết quả chưa được nhập');
            }

            // Update review fields
            service.resultReviewedAt = new Date();
            service.resultReviewedByUserId = currentUser.id;
            if (dto.notes) {
                service.resultNotes = (service.resultNotes || '') + '\n[Review] ' + dto.notes;
            }
            service.updatedBy = currentUser.id;

            // If rejected, reset result status
            if (!dto.approved) {
                service.resultStatus = 'PENDING';
                service.resultReviewedAt = null;
                service.resultReviewedByUserId = null;
            }

            const savedService = await manager.save(StoredServiceRequestServiceEntity, service);

            return {
                id: savedService.id,
                resultReviewedAt: savedService.resultReviewedAt!,
                resultReviewedByUserId: savedService.resultReviewedByUserId!,
            };
        });
    }

    /**
     * Phê duyệt kết quả
     */
    async approveResult(
        storedReqId: string,
        serviceId: string,
        dto: ApproveResultDto,
        currentUser: CurrentUser
    ): Promise<{ id: string; resultApprovedAt: Date; resultApprovedByUserId: string }> {
        return this.dataSource.transaction(async (manager) => {
            // Validate stored request exists
            const storedRequest = await this.storedRepo.findById(storedReqId);
            if (!storedRequest) {
                throw new NotFoundException(`Stored Service Request với ID ${storedReqId} không tìm thấy`);
            }

            // Find service
            const service = await this.serviceRepo.findById(serviceId);
            if (!service) {
                throw new NotFoundException(`Service với ID ${serviceId} không tìm thấy`);
            }

            // Validate service belongs to stored request
            if (service.storedServiceRequestId !== storedReqId) {
                throw new BadRequestException('Service không thuộc Service Request này');
            }

            // Check if result has been reviewed
            if (!service.resultReviewedAt) {
                throw new BadRequestException('Kết quả chưa được review');
            }

            // Update approve fields
            service.resultApprovedAt = new Date();
            service.resultApprovedByUserId = currentUser.id;
            if (dto.notes) {
                service.resultNotes = (service.resultNotes || '') + '\n[Approve] ' + dto.notes;
            }
            service.updatedBy = currentUser.id;

            const savedService = await manager.save(StoredServiceRequestServiceEntity, service);

            return {
                id: savedService.id,
                resultApprovedAt: savedService.resultApprovedAt!,
                resultApprovedByUserId: savedService.resultApprovedByUserId!,
            };
        });
    }

    /**
     * Kiểm tra Quality Control
     */
    async qcResult(
        storedReqId: string,
        serviceId: string,
        dto: QcResultDto,
        currentUser: CurrentUser
    ): Promise<{ id: string; qcStatus: string; qcCheckedAt: Date; qcCheckedByUserId: string }> {
        return this.dataSource.transaction(async (manager) => {
            // Validate stored request exists
            const storedRequest = await this.storedRepo.findById(storedReqId);
            if (!storedRequest) {
                throw new NotFoundException(`Stored Service Request với ID ${storedReqId} không tìm thấy`);
            }

            // Find service
            const service = await this.serviceRepo.findById(serviceId);
            if (!service) {
                throw new NotFoundException(`Service với ID ${serviceId} không tìm thấy`);
            }

            // Validate service belongs to stored request
            if (service.storedServiceRequestId !== storedReqId) {
                throw new BadRequestException('Service không thuộc Service Request này');
            }

            // Update QC fields
            service.qcStatus = dto.qcStatus;
            service.qcCheckedAt = new Date();
            service.qcCheckedByUserId = currentUser.id;
            if (dto.notes) {
                service.resultNotes = (service.resultNotes || '') + '\n[QC] ' + dto.notes;
            }
            service.updatedBy = currentUser.id;

            const savedService = await manager.save(StoredServiceRequestServiceEntity, service);

            return {
                id: savedService.id,
                qcStatus: savedService.qcStatus!,
                qcCheckedAt: savedService.qcCheckedAt!,
                qcCheckedByUserId: savedService.qcCheckedByUserId!,
            };
        });
    }

    async updateDocumentId(serviceId: string, documentId: number, currentUser: CurrentUser): Promise<void> {
        return this.dataSource.transaction(async (manager) => {
            // Kiểm tra service có tồn tại không
            const service = await this.serviceRepo.findById(serviceId);
            if (!service) {
                throw new NotFoundException(`Service với ID ${serviceId} không tồn tại`);
            }

            // Cập nhật documentId
            await this.serviceRepo.updateDocumentId(serviceId, documentId);

            // Log update
            const updatedService = await this.serviceRepo.findById(serviceId);
            if (updatedService) {
                updatedService.updatedBy = currentUser.id;
                await manager.save(StoredServiceRequestServiceEntity, updatedService);
            }
        });
    }
}

