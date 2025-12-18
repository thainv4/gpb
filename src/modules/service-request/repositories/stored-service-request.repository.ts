import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { StoredServiceRequest } from '../entities/stored-service-request.entity';
import { IStoredServiceRequestRepository } from '../interfaces/stored-service-request.repository.interface';

@Injectable()
export class StoredServiceRequestRepository implements IStoredServiceRequestRepository {
    constructor(
        @InjectRepository(StoredServiceRequest)
        private readonly repo: Repository<StoredServiceRequest>,
    ) { }

    async findById(id: string): Promise<StoredServiceRequest | null> {
        return this.repo.findOne({
            where: { id, deletedAt: IsNull() },
        });
    }

    async findByIdWithRelations(id: string): Promise<StoredServiceRequest | null> {
        return this.repo.findOne({
            where: { id, deletedAt: IsNull() },
            relations: ['services', 'services.children'],
            order: {
                services: {
                    testOrder: 'ASC',
                    createdAt: 'ASC',
                    children: {
                        testOrder: 'ASC',
                        createdAt: 'ASC',
                    },
                },
            },
        });
    }

    async findByServiceReqCode(serviceReqCode: string): Promise<StoredServiceRequest | null> {
        return this.repo.findOne({
            where: { serviceReqCode, deletedAt: IsNull() },
        });
    }

    async save(entity: StoredServiceRequest): Promise<StoredServiceRequest> {
        return this.repo.save(entity);
    }

    async remove(id: string): Promise<void> {
        await this.repo.softDelete(id);
    }
}

