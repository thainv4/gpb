import { Hl7OutQueue } from './entities/hl7-out-queue.entity';
import { Hl7OutQueueListItemDto } from './dto/responses/hl7-out-queue-list-item.dto';
import { Hl7OutQueueDetailDto } from './dto/responses/hl7-out-queue-detail.dto';
import { bufferToHex } from './utils/hl7-queue-id.util';
import { formatPatientDobForApi } from './utils/format-patient-dob-for-api';

export function toHl7OutQueueListItemDto(entity: Hl7OutQueue): Hl7OutQueueListItemDto {
    return {
        id: bufferToHex(entity.id),
        lisCaseId: entity.lisCaseId ?? '',
        slideId: entity.slideId ?? null,
        blockId: entity.blockId ?? null,
        testVantageCode: entity.testVantageCode ?? null,
        testCode: entity.testCode ?? null,
        status: entity.status,
        createdTime: entity.createdTime,
        sentTime: entity.sentTime ?? null,
        errorMessage: entity.errorMessage ?? null,
        retryCount: entity.retryCount,
    };
}

export function toHl7OutQueueDetailDto(entity: Hl7OutQueue): Hl7OutQueueDetailDto {
    const base = toHl7OutQueueListItemDto(entity);
    return {
        ...base,
        patientFamily: entity.patientFamily ?? null,
        patientGiven: entity.patientGiven ?? null,
        patientDob: formatPatientDobForApi(entity.patientDob),
        patientGender: entity.patientGender ?? null,
    };
}
