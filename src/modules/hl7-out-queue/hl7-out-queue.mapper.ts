import { Hl7OutQueue } from './entities/hl7-out-queue.entity';
import { Hl7OutQueueListItemDto } from './dto/responses/hl7-out-queue-list-item.dto';
import { bufferToHex } from './utils/hl7-queue-id.util';

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
