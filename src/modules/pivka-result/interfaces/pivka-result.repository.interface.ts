import { PivkaResult } from '../entities/pivka-result.entity';

export interface IPivkaResultRepository {
    findById(id: string): Promise<PivkaResult | null>;
    save(entity: PivkaResult): Promise<PivkaResult>;
    delete(id: string): Promise<void>;
    softDelete(id: string): Promise<void>;

    findAllWithPagination(
        limit: number,
        offset: number,
        sortBy?: string,
        sortOrder?: 'ASC' | 'DESC'
    ): Promise<[PivkaResult[], number]>;
}

