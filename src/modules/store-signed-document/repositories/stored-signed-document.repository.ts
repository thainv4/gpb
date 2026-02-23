import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { StoredSignedDocument } from '../entities/stored-signed-document.entity';
import { IStoredSignedDocumentRepository } from '../interfaces/stored-signed-document.repository.interface';

@Injectable()
export class StoredSignedDocumentRepository implements IStoredSignedDocumentRepository {
    constructor(
        @InjectRepository(StoredSignedDocument)
        private readonly repo: Repository<StoredSignedDocument>,
    ) {}

    async findById(id: string): Promise<StoredSignedDocument | null> {
        return this.repo.findOne({
            where: { id, deletedAt: IsNull() },
        });
    }

    async findByStoredServiceReqId(storedServiceReqId: string): Promise<StoredSignedDocument | null> {
        return this.repo.findOne({
            where: { storedServiceReqId, deletedAt: IsNull() },
        });
    }

    async findByHisServiceReqCode(hisServiceReqCode: string): Promise<StoredSignedDocument | null> {
        return this.repo.findOne({
            where: { hisServiceReqCode, deletedAt: IsNull() },
        });
    }

    async findByDocumentId(documentId: number): Promise<StoredSignedDocument | null> {
        return this.repo.findOne({
            where: { documentId, deletedAt: IsNull() },
        });
    }

    async save(entity: StoredSignedDocument): Promise<StoredSignedDocument> {
        return this.repo.save(entity);
    }

    async softDelete(id: string): Promise<void> {
        await this.repo.softDelete(id);
    }

    async hardDelete(id: string): Promise<void> {
        await this.repo.delete(id);
    }

    async findWithPagination(
        limit: number,
        offset: number,
        search?: string,
        documentId?: number
    ): Promise<[StoredSignedDocument[], number]> {
        const qb = this.repo
            .createQueryBuilder('doc')
            .where('doc.deletedAt IS NULL')
            .orderBy('doc.createdAt', 'DESC')
            .limit(limit)
            .offset(offset);

        if (search) {
            qb.andWhere(
                '(doc.hisServiceReqCode LIKE :search OR doc.storedServiceReqId LIKE :search)',
                { search: `%${search}%` }
            );
        }

        if (documentId !== undefined && documentId !== null) {
            qb.andWhere('doc.documentId = :documentId', { documentId });
        }

        return qb.getManyAndCount();
    }
}
