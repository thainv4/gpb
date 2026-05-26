import { Hl7OutQueue } from '../entities/hl7-out-queue.entity';

export interface IHl7OutQueueRepository {
    save(entity: Hl7OutQueue): Promise<Hl7OutQueue>;
    findById(id: Buffer): Promise<Hl7OutQueue | null>;
    findByLisCaseId(lisCaseId: string): Promise<Hl7OutQueue[]>;
}
