import { ServiceGroup } from '../entities/service-group.entity';

export interface IServiceGroupRepository {
    findById(id: string): Promise<ServiceGroup | null>;
    findByCode(serviceGroupCode: string): Promise<ServiceGroup | null>;
    existsByCode(serviceGroupCode: string): Promise<boolean>;
    save(serviceGroup: ServiceGroup): Promise<ServiceGroup>;
    delete(id: string): Promise<void>;
    findWithPagination(limit: number, offset: number, search?: string, isActive?: boolean): Promise<[ServiceGroup[], number]>;
    findActiveServiceGroups(): Promise<ServiceGroup[]>;
    findByMapping(mapping: string): Promise<ServiceGroup[]>;
    findByIds(ids: string[]): Promise<ServiceGroup[]>;
    findByCodes(codes: string[]): Promise<ServiceGroup[]>;
    getNextSortOrder(): Promise<number>;
    searchServiceGroups(search: string, isActive?: boolean, sortBy?: string, sortOrder?: 'ASC' | 'DESC'): Promise<ServiceGroup[]>;
}
