import { StoredServiceRequestService } from '../entities/stored-service-request-service.entity';

export interface IStoredServiceRequestServiceRepository {
    findById(id: string): Promise<StoredServiceRequestService | null>;
    findByIdWithRelations(id: string): Promise<StoredServiceRequestService | null>;
    findByParentServiceId(parentServiceId: string): Promise<StoredServiceRequestService[]>;
    findByStoredServiceRequestId(storedServiceRequestId: string): Promise<StoredServiceRequestService[]>;
    save(entity: StoredServiceRequestService): Promise<StoredServiceRequestService>;
    updateDocumentId(id: string, documentId: number | null): Promise<void>;
    hardDelete(id: string): Promise<void>; // Hard delete (xóa hoàn toàn)
    hardDeleteByStoredServiceRequestId(storedServiceRequestId: string): Promise<void>; // Xóa tất cả services theo storedServiceRequestId
}

