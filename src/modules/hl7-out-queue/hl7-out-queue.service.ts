import { Injectable, Inject } from '@nestjs/common';
import { Hl7OutQueue } from './entities/hl7-out-queue.entity';
import { IHl7OutQueueRepository } from './interfaces/hl7-out-queue.repository.interface';

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
}
