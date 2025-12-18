import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Like } from 'typeorm';
import { SampleType } from './entities/sample-type.entity';
import { ISampleTypeRepository } from './interfaces/sample-type.repository.interface';

@Injectable()
export class SampleTypeRepository implements ISampleTypeRepository {
    constructor(
        @InjectRepository(SampleType)
        private readonly sampleTypeRepository: Repository<SampleType>,
    ) { }

    async findById(id: string): Promise<SampleType | null> {
        return this.sampleTypeRepository.findOne({
            where: { id, deletedAt: IsNull() },
        });
    }

    async findByCode(typeCode: string): Promise<SampleType | null> {
        return this.sampleTypeRepository.findOne({
            where: { typeCode, deletedAt: IsNull() },
        });
    }

    async existsByCode(typeCode: string): Promise<boolean> {
        const count = await this.sampleTypeRepository.count({
            where: { typeCode, deletedAt: IsNull() },
        });
        return count > 0;
    }

    async existsByName(typeName: string): Promise<boolean> {
        const count = await this.sampleTypeRepository.count({
            where: { typeName, deletedAt: IsNull() },
        });
        return count > 0;
    }

    async save(sampleType: SampleType): Promise<SampleType> {
        return this.sampleTypeRepository.save(sampleType);
    }

    async delete(id: string): Promise<void> {
        await this.sampleTypeRepository.softDelete(id);
    }

    async findWithPagination(limit: number, offset: number, search?: string): Promise<[SampleType[], number]> {
        const queryBuilder = this.sampleTypeRepository
            .createQueryBuilder('sampleType')
            .where('sampleType.deletedAt IS NULL')
            .orderBy('sampleType.sortOrder', 'ASC')
            .addOrderBy('sampleType.createdAt', 'DESC')
            .limit(limit)
            .offset(offset);

        if (search) {
            queryBuilder.andWhere(
                '(sampleType.typeCode LIKE :search OR sampleType.typeName LIKE :search OR sampleType.shortName LIKE :search)',
                { search: `%${search}%` }
            );
        }

        return queryBuilder.getManyAndCount();
    }

    async findActiveWithSorting(): Promise<SampleType[]> {
        return this.sampleTypeRepository.find({
            where: { deletedAt: IsNull() },
            order: { sortOrder: 'ASC', createdAt: 'DESC' },
        });
    }

    async getNextSortOrder(): Promise<number> {
        const result = await this.sampleTypeRepository
            .createQueryBuilder('sampleType')
            .select('MAX(sampleType.sortOrder)', 'maxOrder')
            .where('sampleType.deletedAt IS NULL')
            .getRawOne();

        return (result?.maxOrder || 0) + 1;
    }
}
