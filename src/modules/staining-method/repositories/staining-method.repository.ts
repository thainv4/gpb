import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { StainingMethod } from '../entities/staining-method.entity';
import { IStainingMethodRepository } from '../interfaces/staining-method.repository.interface';

@Injectable()
export class StainingMethodRepository implements IStainingMethodRepository {
    constructor(
        @InjectRepository(StainingMethod)
        private readonly repository: Repository<StainingMethod>,
    ) { }

    async findById(id: string): Promise<StainingMethod | null> {
        return this.repository.findOne({ where: { id, deletedAt: IsNull() } });
    }

    async findByMethodName(methodName: string): Promise<StainingMethod | null> {
        return this.repository.findOne({ 
            where: { methodName, deletedAt: IsNull() } 
        });
    }

    async existsByName(methodName: string): Promise<boolean> {
        const count = await this.repository.count({ where: { methodName, deletedAt: IsNull() } });
        return count > 0;
    }

    async save(stainingMethod: StainingMethod): Promise<StainingMethod> {
        return this.repository.save(stainingMethod);
    }

    async delete(id: string): Promise<void> {
        await this.repository.softDelete(id);
    }

    async findWithPagination(limit: number, offset: number, search?: string): Promise<[StainingMethod[], number]> {
        const qb = this.repository
            .createQueryBuilder('method')
            .where('method.deletedAt IS NULL')
            .orderBy('method.createdAt', 'DESC')
            .limit(limit)
            .offset(offset);

        if (search) {
            qb.andWhere('LOWER(method.methodName) LIKE :search', { search: `%${search.toLowerCase()}%` });
        }

        return qb.getManyAndCount();
    }
}
