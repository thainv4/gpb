import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { StoredServiceResult } from '../entities/stored-service-result.entity';
import { IStoredServiceResultRepository } from '../interfaces/stored-service-result.repository.interface';

@Injectable()
export class StoredServiceResultRepository implements IStoredServiceResultRepository {
    constructor(
        @InjectRepository(StoredServiceResult)
        private readonly repo: Repository<StoredServiceResult>,
    ) { }

    async create(entity: StoredServiceResult): Promise<StoredServiceResult> {
        return this.repo.save(entity);
    }

    async findById(id: string): Promise<StoredServiceResult | null> {
        return this.repo.findOne({
            where: { id, deletedAt: IsNull() },
        });
    }

    async findByServiceId(storedSrServiceId: string): Promise<StoredServiceResult[]> {
        return this.repo.find({
            where: { storedSrServiceId, deletedAt: IsNull() },
            order: { createdAt: 'DESC' },
        });
    }

    async update(entity: StoredServiceResult): Promise<StoredServiceResult> {
        return this.repo.save(entity);
    }

    async delete(id: string): Promise<void> {
        await this.repo.softDelete(id);
    }
}
