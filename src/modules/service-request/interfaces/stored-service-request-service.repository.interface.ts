import { StoredServiceRequestService } from '../entities/stored-service-request-service.entity';

export interface IStoredServiceRequestServiceRepository {
    findById(id: string): Promise<StoredServiceRequestService | null>;
    findByParentServiceId(parentServiceId: string): Promise<StoredServiceRequestService[]>;
    save(entity: StoredServiceRequestService): Promise<StoredServiceRequestService>;
    updateDocumentId(id: string, documentId: number | null): Promise<void>;
}

