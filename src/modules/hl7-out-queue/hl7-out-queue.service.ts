import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Hl7OutQueue } from './entities/hl7-out-queue.entity';
import { IHl7OutQueueRepository } from './interfaces/hl7-out-queue.repository.interface';
import { Hl7OutQueueListItemDto } from './dto/responses/hl7-out-queue-list-item.dto';
import { toHl7OutQueueListItemDto } from './hl7-out-queue.mapper';

export interface GetHl7OutQueueListResult {
    items: Hl7OutQueueListItemDto[];
    total: number;
    limit: number;
    offset: number;
}

@Injectable()
export class Hl7OutQueueService {
    constructor(
        @Inject('IHl7OutQueueRepository')
        private readonly hl7OutQueueRepo: IHl7OutQueueRepository,
    ) {}

    async enqueue(input: Partial<Hl7OutQueue>): Promise<Hl7OutQueue> {
        const entity = Object.assign(new Hl7OutQueue(), {
            status: 0,
            retryCount: 0,
            ...input,
        });
        return this.hl7OutQueueRepo.save(entity);
    }

    async findById(id: Buffer): Promise<Hl7OutQueue | null> {
        return this.hl7OutQueueRepo.findById(id);
    }

    async findByLisCaseId(lisCaseId: string): Promise<Hl7OutQueue[]> {
        return this.hl7OutQueueRepo.findByLisCaseId(lisCaseId);
    }

    async getList(
        limit: number,
        offset: number,
        lisCaseId?: string,
    ): Promise<GetHl7OutQueueListResult> {
        const [entities, total] = await this.hl7OutQueueRepo.findWithPagination(limit, offset, {
            lisCaseId: lisCaseId?.trim() || undefined,
        });
        return {
            items: entities.map(toHl7OutQueueListItemDto),
            total,
            limit,
            offset,
        };
    }

    toListItemDto(entity: Hl7OutQueue): Hl7OutQueueListItemDto {
        return toHl7OutQueueListItemDto(entity);
    }

    async cancelBatch(ids: Buffer[]): Promise<Hl7OutQueue[]> {
        const results: Hl7OutQueue[] = [];

        for (const id of ids) {
            const entity = await this.hl7OutQueueRepo.findById(id);
            if (!entity) {
                throw new NotFoundException(`HL7 queue record not found: ${id.toString('hex').toUpperCase()}`);
            }
            entity.status = 3;
            results.push(await this.hl7OutQueueRepo.save(entity));
        }

        return results;
    }
}
