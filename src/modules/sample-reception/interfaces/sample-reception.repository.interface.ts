import { SampleReception } from '../entities/sample-reception.entity';

export interface ISampleReceptionRepository {
    findById(id: string): Promise<SampleReception | null>;
    findByCode(receptionCode: string): Promise<SampleReception | null>;
    existsByCode(receptionCode: string): Promise<boolean>;
    save(sampleReception: SampleReception): Promise<SampleReception>;
    delete(id: string): Promise<void>;
    findWithPagination(limit: number, offset: number, search?: string): Promise<[SampleReception[], number]>;
    countByDateAndType(sampleTypeCode: string, date: Date): Promise<number>;
    findTodayReceptions(): Promise<SampleReception[]>;
    findByDateRange(startDate: Date, endDate: Date): Promise<SampleReception[]>;
    getNextSequenceNumber(sampleTypeId: string, date: Date, resetPeriod?: string): Promise<number>;
    findByReceptionCode(receptionCode: string): Promise<SampleReception | null>;
}
