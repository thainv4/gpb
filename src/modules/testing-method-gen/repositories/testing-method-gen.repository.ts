import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TestingMethodGen } from '../entities/testing-method-gen.entity';
import { ITestingMethodGenRepository } from '../interfaces/testing-method-gen.repository.interface';

@Injectable()
export class TestingMethodGenRepository implements ITestingMethodGenRepository {
    constructor(
        @InjectRepository(TestingMethodGen)
        private readonly repository: Repository<TestingMethodGen>,
    ) {}

    async findById(id: string): Promise<TestingMethodGen | null> {
        return this.repository.findOne({ where: { id, deletedAt: IsNull() } });
    }

    async findByMethodName(methodName: string): Promise<TestingMethodGen | null> {
        return this.repository.findOne({
            where: { methodName, deletedAt: IsNull() },
        });
    }

    async existsByName(methodName: string): Promise<boolean> {
        const count = await this.repository.count({
            where: { methodName, deletedAt: IsNull() },
        });
        return count > 0;
    }

    async save(entity: TestingMethodGen): Promise<TestingMethodGen> {
        return this.repository.save(entity);
    }

    async delete(id: string): Promise<void> {
        await this.repository.softDelete(id);
    }

    async findWithPagination(
        limit: number,
        offset: number,
        search?: string,
    ): Promise<[TestingMethodGen[], number]> {
        const qb = this.repository
            .createQueryBuilder('method')
            .where('method.deletedAt IS NULL')
            .orderBy('method.createdAt', 'DESC')
            .limit(limit)
            .offset(offset);

        if (search) {
            qb.andWhere('LOWER(method.methodName) LIKE :search', {
                search: `%${search.toLowerCase()}%`,
            });
        }

        return qb.getManyAndCount();
    }
}
