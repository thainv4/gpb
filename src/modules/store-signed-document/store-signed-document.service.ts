import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseService } from '../../common/services/base.service';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { AppError } from '../../common/errors/app.error';
import { CurrentUser } from '../../common/interfaces/current-user.interface';
import { StoredSignedDocument } from './entities/stored-signed-document.entity';
import { IStoredSignedDocumentRepository } from './interfaces/stored-signed-document.repository.interface';
import { CreateStoredSignedDocumentDto } from './dto/commands/create-stored-signed-document.dto';
import { UpdateStoredSignedDocumentDto } from './dto/commands/update-stored-signed-document.dto';
import { GetStoredSignedDocumentsDto } from './dto/queries/get-stored-signed-documents.dto';
import { StoredSignedDocumentResponseDto } from './dto/responses/stored-signed-document-response.dto';
import { ServiceRequestAuditLogService } from '../service-request-audit-log/services/service-request-audit-log.service';
import { AuditEventCode, AuditScope } from '../service-request-audit-log/constants/audit-log.constants';

export interface GetStoredSignedDocumentsResult {
    items: StoredSignedDocumentResponseDto[];
    total: number;
    limit: number;
    offset: number;
}

@Injectable()
export class StoredSignedDocumentService extends BaseService {
    constructor(
        @Inject('IStoredSignedDocumentRepository')
        private readonly storedSignedDocumentRepo: IStoredSignedDocumentRepository,
        @Inject(DataSource)
        protected readonly dataSource: DataSource,
        @Inject(CurrentUserContextService)
        protected readonly currentUserContext: CurrentUserContextService,
        private readonly auditLogService: ServiceRequestAuditLogService,
    ) {
        super(dataSource, currentUserContext);
    }

    async create(createDto: CreateStoredSignedDocumentDto, currentUser: CurrentUser): Promise<string> {
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            const entity = new StoredSignedDocument();
            entity.storedServiceReqId = createDto.storedServiceReqId;
            entity.hisServiceReqCode = createDto.hisServiceReqCode;
            entity.documentId = createDto.documentId ?? null;
            entity.signedDocumentBase64 = createDto.signedDocumentBase64 ?? null;
            entity.createdAt = new Date();
            this.setAuditFields(entity, false);

            const saved = await manager.save(StoredSignedDocument, entity);
            return saved.id;
        }).then(async (docId) => {
            await this.auditLogService.safeAppend(
                {
                    eventCode: AuditEventCode.DOCUMENT_STORED,
                    storedServiceReqId: createDto.storedServiceReqId,
                    scope: AuditScope.TICKET,
                    payload: { documentId: createDto.documentId ?? null, storedSignedDocumentId: docId },
                },
                currentUser,
            );
            return docId;
        });
    }

    async update(id: string, updateDto: UpdateStoredSignedDocumentDto, currentUser: CurrentUser): Promise<void> {
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            const existing = await this.storedSignedDocumentRepo.findById(id);
            if (!existing) {
                throw AppError.notFound('Stored signed document not found');
            }

            if (updateDto.storedServiceReqId !== undefined) {
                existing.storedServiceReqId = updateDto.storedServiceReqId;
            }
            if (updateDto.hisServiceReqCode !== undefined) {
                existing.hisServiceReqCode = updateDto.hisServiceReqCode;
            }
            if (updateDto.documentId !== undefined) {
                existing.documentId = updateDto.documentId ?? null;
            }
            if (updateDto.signedDocumentBase64 !== undefined) {
                existing.signedDocumentBase64 = updateDto.signedDocumentBase64 ?? null;
            }
            this.setAuditFields(existing, true);

            await manager.save(StoredSignedDocument, existing);
        });
    }

    async delete(id: string): Promise<void> {
        const existing = await this.storedSignedDocumentRepo.findById(id);
        if (!existing) {
            throw AppError.notFound('Stored signed document not found');
        }

        await this.storedSignedDocumentRepo.softDelete(id);
    }

    async getById(id: string, includeBase64 = true): Promise<StoredSignedDocumentResponseDto> {
        const entity = await this.storedSignedDocumentRepo.findById(id);
        if (!entity) {
            throw AppError.notFound('Stored signed document not found');
        }

        return this.mapToResponse(entity, includeBase64);
    }

    async getDocumentBufferById(id: string): Promise<{ buffer: Buffer; contentType: string }> {
        const entity = await this.storedSignedDocumentRepo.findById(id);
        if (!entity) {
            throw AppError.notFound('Stored signed document not found');
        }
        const base64 = entity.signedDocumentBase64;
        if (!base64) {
            throw AppError.notFound('Signed document content is empty');
        }
        const buffer = Buffer.from(base64, 'base64');
        const contentType = 'application/pdf';
        return { buffer, contentType };
    }

    async getByStoredServiceReqId(storedServiceReqId: string): Promise<StoredSignedDocumentResponseDto | null> {
        const entity =
            await this.storedSignedDocumentRepo.findLatestByStoredServiceReqId(storedServiceReqId);
        if (!entity) {
            return null;
        }

        return this.mapToResponse(entity, true);
    }

    async getDocumentBufferByStoredServiceReqId(
        storedServiceReqId: string
    ): Promise<{ buffer: Buffer; contentType: string }> {
        const entity =
            await this.storedSignedDocumentRepo.findLatestByStoredServiceReqId(storedServiceReqId);
        if (!entity) {
            throw AppError.notFound('Stored signed document not found');
        }
        const base64 = entity.signedDocumentBase64;
        if (!base64) {
            throw AppError.notFound('Signed document content is empty');
        }
        const buffer = Buffer.from(base64, 'base64');
        return { buffer, contentType: 'application/pdf' };
    }

    async getByHisServiceReqCode(hisServiceReqCode: string): Promise<StoredSignedDocumentResponseDto | null> {
        const entity =
            await this.storedSignedDocumentRepo.findLatestByHisServiceReqCode(hisServiceReqCode);
        if (!entity) {
            return null;
        }

        return this.mapToResponse(entity, true);
    }

    async getDocumentBufferByHisServiceReqCode(
        hisServiceReqCode: string
    ): Promise<{ buffer: Buffer; contentType: string }> {
        const entity =
            await this.storedSignedDocumentRepo.findLatestByHisServiceReqCode(hisServiceReqCode);
        if (!entity) {
            throw AppError.notFound('Stored signed document not found');
        }
        const base64 = entity.signedDocumentBase64;
        if (!base64) {
            throw AppError.notFound('Signed document content is empty');
        }
        const buffer = Buffer.from(base64, 'base64');
        return { buffer, contentType: 'application/pdf' };
    }

    async getByDocumentId(documentId: number): Promise<StoredSignedDocumentResponseDto | null> {
        const entity = await this.storedSignedDocumentRepo.findByDocumentId(documentId);
        if (!entity) {
            return null;
        }

        return this.mapToResponse(entity, true);
    }

    async getDocumentBufferByDocumentId(documentId: number): Promise<{ buffer: Buffer; contentType: string }> {
        const entity = await this.storedSignedDocumentRepo.findByDocumentId(documentId);
        if (!entity) {
            throw AppError.notFound('Stored signed document not found');
        }
        const base64 = entity.signedDocumentBase64;
        if (!base64) {
            throw AppError.notFound('Signed document content is empty');
        }
        const buffer = Buffer.from(base64, 'base64');
        return { buffer, contentType: 'application/pdf' };
    }

    async getList(query: GetStoredSignedDocumentsDto, includeBase64 = false): Promise<GetStoredSignedDocumentsResult> {
        const { limit = 10, offset = 0, search, documentId } = query;
        const [entities, total] = await this.storedSignedDocumentRepo.findWithPagination(
            limit,
            offset,
            search,
            documentId
        );

        return {
            items: entities.map((e) => this.mapToResponse(e, includeBase64)),
            total,
            limit,
            offset,
        };
    }

    private mapToResponse(entity: StoredSignedDocument, includeBase64: boolean): StoredSignedDocumentResponseDto {
        return {
            id: entity.id,
            storedServiceReqId: entity.storedServiceReqId,
            hisServiceReqCode: entity.hisServiceReqCode,
            documentId: entity.documentId ?? null,
            signedDocumentBase64: includeBase64 ? entity.signedDocumentBase64 ?? null : undefined,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            createdBy: entity.createdBy ?? null,
            updatedBy: entity.updatedBy ?? null,
            version: entity.version,
        };
    }
}
