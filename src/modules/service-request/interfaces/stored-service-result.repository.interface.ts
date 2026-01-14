import { StoredServiceResult } from '../entities/stored-service-result.entity';

export interface IStoredServiceResultRepository {
    create(entity: StoredServiceResult): Promise<StoredServiceResult>;
    findById(id: string): Promise<StoredServiceResult | null>;
    findByServiceId(storedSrServiceId: string): Promise<StoredServiceResult[]>;
    update(entity: StoredServiceResult): Promise<StoredServiceResult>;
    delete(id: string): Promise<void>;
}
