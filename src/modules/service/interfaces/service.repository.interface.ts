import { Service } from '../entities/service.entity';
import { BaseRepository } from '../../../common/interfaces/base-repository.interface';

export interface IServiceRepository extends BaseRepository<Service> {
    findByServiceCode(serviceCode: string): Promise<Service | null>;
    findByServiceGroupId(serviceGroupId: string): Promise<Service[]>;
    findByParentServiceId(parentServiceId: string): Promise<Service[]>;
    findActiveServices(): Promise<Service[]>;
    findServicesByPriceRange(minPrice: number, maxPrice: number): Promise<Service[]>;
    searchServices(searchTerm: string): Promise<Service[]>;
    findServicesWithChildren(serviceId: string): Promise<Service | null>;
    findServiceHierarchy(serviceId: string): Promise<Service | null>;
    findServicesByGroupId(groupId: string, limit?: number, offset?: number): Promise<{ services: Service[]; total: number }>;
    getPaginatedServices(query: any): Promise<{ services: Service[]; total: number }>;
    findServicesByHierarchyLevel(level: number): Promise<Service[]>;
    findRootServices(): Promise<Service[]>;
    findSubServicesByParentId(parentId: string): Promise<Service[]>;
    existsByServiceCode(serviceCode: string, excludeId?: string): Promise<boolean>;
    reorderServices(serviceIds: string[]): Promise<void>;
    findServicesByMapping(mappingKey: string, mappingValue: string): Promise<Service[]>;
}
