import { SampleRejection } from '../entities/sample-rejection.entity';

export interface ISampleRejectionRepository {
    findById(id: string): Promise<SampleRejection | null>;
    save(sampleRejection: SampleRejection): Promise<SampleRejection>;
    delete(id: string): Promise<void>;
    findWithPagination(limit: number, offset: number, search?: string): Promise<[SampleRejection[], number]>;
}
