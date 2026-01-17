import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { StoredServiceRequestService } from '../entities/stored-service-request-service.entity';
import { IStoredServiceRequestServiceRepository } from '../interfaces/stored-service-request-service.repository.interface';

@Injectable()
export class StoredServiceRequestServiceRepository implements IStoredServiceRequestServiceRepository {
    constructor(
        @InjectRepository(StoredServiceRequestService)
        private readonly repo: Repository<StoredServiceRequestService>,
    ) { }

    async findById(id: string): Promise<StoredServiceRequestService | null> {
        return this.repo.findOne({
            where: { id, deletedAt: IsNull() },
        });
    }

    async findByIdWithRelations(id: string): Promise<StoredServiceRequestService | null> {
        return this.repo.findOne({
            where: { id, deletedAt: IsNull() },
            relations: ['storedServiceRequest'],
        });
    }

    async findByParentServiceId(parentServiceId: string): Promise<StoredServiceRequestService[]> {
        return this.repo.find({
            where: { parentServiceId, deletedAt: IsNull() },
            order: { testOrder: 'ASC', createdAt: 'ASC' },
        });
    }

    async findByStoredServiceRequestId(storedServiceRequestId: string): Promise<StoredServiceRequestService[]> {
        return this.repo.find({
            where: { storedServiceRequestId, deletedAt: IsNull() },
            order: { testOrder: 'ASC', createdAt: 'ASC' },
        });
    }

    async findByDocumentId(documentId: number): Promise<StoredServiceRequestService | null> {
        return this.repo.findOne({
            where: { documentId, deletedAt: IsNull() },
        });
    }

    async save(entity: StoredServiceRequestService): Promise<StoredServiceRequestService> {
        return this.repo.save(entity);
    }

    async updateDocumentId(id: string, documentId: number | null): Promise<void> {
        await this.repo.update(
            { id, deletedAt: IsNull() },
            { documentId }
        );
    }

    async hardDelete(id: string): Promise<void> {
        await this.repo.delete(id);
    }

    async hardDeleteByStoredServiceRequestId(storedServiceRequestId: string): Promise<void> {
        await this.repo.delete({ storedServiceRequestId });
    }
}

