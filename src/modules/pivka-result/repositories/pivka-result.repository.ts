import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PivkaResult } from '../entities/pivka-result.entity';
import { IPivkaResultRepository } from '../interfaces/pivka-result.repository.interface';

@Injectable()
export class PivkaResultRepository implements IPivkaResultRepository {
    constructor(
        @InjectRepository(PivkaResult)
        private readonly repo: Repository<PivkaResult>,
    ) { }

    async findById(id: string): Promise<PivkaResult | null> {
        return this.repo.findOne({
            where: { id, deletedAt: IsNull() },
        });
    }

    async findActiveByStoredSrServicesId(storedSrServicesId: string): Promise<PivkaResult | null> {
        return this.repo.findOne({
            where: { storedSrServicesId, deletedAt: IsNull() },
        });
    }

    async save(entity: PivkaResult): Promise<PivkaResult> {
        return this.repo.save(entity);
    }

    async delete(id: string): Promise<void> {
        await this.repo.delete(id);
    }

    async softDelete(id: string): Promise<void> {
        await this.repo.update(id, { deletedAt: new Date() });
    }

    async findAllWithPagination(
        limit: number,
        offset: number,
        sortBy: string = 'createdAt',
        sortOrder: 'ASC' | 'DESC' = 'DESC',
    ): Promise<[PivkaResult[], number]> {
        // Keep sorting limited to safe fields.
        const validSortFields = ['createdAt', 'updatedAt', 'id'];
        const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

        return this.repo.findAndCount({
            where: { deletedAt: IsNull() },
            order: { [field]: sortOrder },
            take: limit,
            skip: offset,
        });
    }
}

