import { StoredSignedDocument } from '../entities/stored-signed-document.entity';

export interface IStoredSignedDocumentRepository {
    findById(id: string): Promise<StoredSignedDocument | null>;
    findByStoredServiceReqId(storedServiceReqId: string): Promise<StoredSignedDocument | null>;
    findByHisServiceReqCode(hisServiceReqCode: string): Promise<StoredSignedDocument | null>;
    findByDocumentId(documentId: number): Promise<StoredSignedDocument | null>;
    save(entity: StoredSignedDocument): Promise<StoredSignedDocument>;
    softDelete(id: string): Promise<void>;
    hardDelete(id: string): Promise<void>;
    findWithPagination(
        limit: number,
        offset: number,
        search?: string,
        documentId?: number
    ): Promise<[StoredSignedDocument[], number]>;
}
