import { StainingMethod } from '../../service-request/entities/staining-method.entity';

export interface IStainingMethodRepository {
    findById(id: string): Promise<StainingMethod | null>;
    existsByName(methodName: string): Promise<boolean>;
    save(stainingMethod: StainingMethod): Promise<StainingMethod>;
    delete(id: string): Promise<void>;
    findWithPagination(limit: number, offset: number, search?: string): Promise<[StainingMethod[], number]>;
}
