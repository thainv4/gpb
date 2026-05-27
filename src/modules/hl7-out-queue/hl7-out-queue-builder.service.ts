import { BadRequestException, Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Hl7OutQueue } from './entities/hl7-out-queue.entity';
import { splitPersonName } from './utils/split-person-name';
import { parsePatientDobFromNumber } from './utils/parse-patient-dob';
import {
    buildBlockId,
    buildSlideId,
    buildSpecimenId,
} from './utils/device-outbound-ids.util';
import { IStoredServiceRequestServiceRepository } from '../service-request/interfaces/stored-service-request-service.repository.interface';
import { IStoredServiceRequestRepository } from '../service-request/interfaces/stored-service-request.repository.interface';
import { IDeviceStainingMethodRepository } from '../device-staining-method/interfaces/device-staining-method.repository.interface';
import { IStainingMethodRepository } from '../staining-method/interfaces/staining-method.repository.interface';
import { ISampleTypeRepository } from '../sample-type/interfaces/sample-type.repository.interface';
import { IUserRepository } from '../user/interfaces/user.repository.interface';
import { CurrentUser } from '../../common/interfaces/current-user.interface';
import { StoredServiceRequestService } from '../service-request/entities/stored-service-request-service.entity';

export interface BuildHl7OutQueueInput {
    receptionCode: string;
    serviceCode: string;
    blockNumber: number;
    slideNumber: number;
    method: string;
}

@Injectable()
export class Hl7OutQueueBuilderService {
    constructor(
        @Inject('IStoredServiceRequestServiceRepository')
        private readonly storedServiceRepo: IStoredServiceRequestServiceRepository,
        @Inject('IStoredServiceRequestRepository')
        private readonly storedRequestRepo: IStoredServiceRequestRepository,
        @Inject('IDeviceStainingMethodRepository')
        private readonly deviceStainingMethodRepo: IDeviceStainingMethodRepository,
        @Inject('IStainingMethodRepository')
        private readonly stainingMethodRepo: IStainingMethodRepository,
        @Inject('ISampleTypeRepository')
        private readonly sampleTypeRepo: ISampleTypeRepository,
        @Inject('IUserRepository')
        private readonly userRepo: IUserRepository,
    ) {}

    async build(input: BuildHl7OutQueueInput, currentUser: CurrentUser): Promise<Partial<Hl7OutQueue>> {
        const receptionCode = input.receptionCode.trim();
        const serviceCode = input.serviceCode.trim();
        const methodName = input.method.trim();

        if (!receptionCode || !serviceCode || !methodName) {
            throw new BadRequestException('receptionCode, serviceCode and method are required');
        }

        const service = await this.resolveServiceLine(receptionCode, serviceCode);
        const storedRequest = await this.storedRequestRepo.findById(service.storedServiceRequestId);
        if (!storedRequest) {
            throw new NotFoundException('Stored service request not found for selected service');
        }

        const deviceStaining = await this.deviceStainingMethodRepo.findByMethodName(methodName);
        if (!deviceStaining) {
            throw new BadRequestException(
                `Device staining method not found for method name: ${methodName}`,
            );
        }

        let stainingMethodName: string | undefined;
        if (storedRequest.stainingMethodId) {
            const stainingMethod = await this.stainingMethodRepo.findById(storedRequest.stainingMethodId);
            stainingMethodName = stainingMethod?.methodName;
        }

        const tissueName = await this.resolveTissueName(service);
        const pathologist = await this.resolvePathologist(currentUser);

        const patientName = splitPersonName(storedRequest.patientName);
        const physicianName = splitPersonName(storedRequest.requestUsername);

        const entity: Partial<Hl7OutQueue> = {
            patientId:
                storedRequest.patientId != null ? String(storedRequest.patientId) : undefined,
            patientFamily: patientName.family || undefined,
            patientGiven: patientName.given || undefined,
            patientDob: parsePatientDobFromNumber(storedRequest.patientDob),
            patientGender: storedRequest.patientGenderName ?? undefined,
            physicianId: storedRequest.requestLoginname ?? undefined,
            physicianFamily: physicianName.family || undefined,
            physicianGiven: physicianName.given || undefined,
            registrationDate: storedRequest.instructionTime ?? undefined,
            orderControl: 'NW',
            lisCaseId: receptionCode,
            approvePhysicianId: undefined,
            approvePhysicianFamily: undefined,
            approvePhysicianGiven: undefined,
            testCode: deviceStaining.protocolNo,
            testVantageCode: deviceStaining.methodName,
            testDescription: service.serviceName ?? undefined,
            receivedDate: undefined,
            tissueName,
            testFlagName: stainingMethodName,
            tissueSubName: stainingMethodName,
            pathologistId: pathologist.id,
            pathologistFamily: pathologist.family,
            pathologistGiven: pathologist.given,
            slideId: buildSlideId(receptionCode, input.blockNumber, input.slideNumber),
            slideNumber: input.slideNumber,
            blockId: buildBlockId(receptionCode, input.blockNumber),
            blockNumber: input.blockNumber,
            specimenId: buildSpecimenId(receptionCode),
            specimenNumber: '1',
            grossDescriptionText: service.resultComment ?? undefined,
            messageType: undefined,
            status: 0,
            retryCount: 0,
            tissueDescription: undefined,
            tissueProcedure: undefined,
            slidesJson: undefined,
            sentTime: undefined,
            errorMessage: undefined,
        };

        return entity;
    }

    private async resolveServiceLine(
        receptionCode: string,
        serviceCode: string,
    ): Promise<StoredServiceRequestService> {
        const services = await this.storedServiceRepo.findByReceptionCode(receptionCode);
        const matches = services.filter(
            (s) => (s.serviceCode ?? '').trim() === serviceCode,
        );
        if (matches.length === 0) {
            throw new NotFoundException(
                `No stored service line found for receptionCode=${receptionCode} and serviceCode=${serviceCode}`,
            );
        }
        if (matches.length > 1) {
            throw new BadRequestException(
                `Multiple service lines found for receptionCode=${receptionCode} and serviceCode=${serviceCode}`,
            );
        }
        return matches[0];
    }

    private async resolveTissueName(service: StoredServiceRequestService): Promise<string | undefined> {
        if (service.sampleTypeName?.trim()) {
            return service.sampleTypeName.trim();
        }
        if (!service.sampleTypeId) {
            return undefined;
        }
        const sampleType = await this.sampleTypeRepo.findById(service.sampleTypeId);
        return sampleType?.typeName ?? undefined;
    }

    private async resolvePathologist(
        currentUser: CurrentUser,
    ): Promise<{ id: string; family?: string; given?: string }> {
        const user = await this.userRepo.findById(currentUser.id);
        const { family, given } = splitPersonName(user?.fullName);
        return {
            id: currentUser.username,
            family: family || undefined,
            given: given || undefined,
        };
    }
}
