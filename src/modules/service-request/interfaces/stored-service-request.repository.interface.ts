import { StoredServiceRequest } from '../entities/stored-service-request.entity';

export interface IStoredServiceRequestRepository {
    findById(id: string): Promise<StoredServiceRequest | null>;
    findByIdWithRelations(id: string): Promise<StoredServiceRequest | null>;
    findByServiceReqCode(serviceReqCode: string): Promise<StoredServiceRequest | null>;
    save(entity: StoredServiceRequest): Promise<StoredServiceRequest>;
    remove(id: string): Promise<void>;
}

