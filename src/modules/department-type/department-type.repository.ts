import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In, Like, SelectQueryBuilder } from 'typeorm';
import { DepartmentType } from './entities/department-type.entity';
import { IDepartmentTypeRepository } from './interfaces/department-type.repository.interface';

@Injectable()
export class DepartmentTypeRepository implements IDepartmentTypeRepository {
    constructor(
        @InjectRepository(DepartmentType)
        private readonly departmentTypeRepository: Repository<DepartmentType>,
    ) { }

    // ========== BASIC CRUD OPERATIONS ==========

    async findById(id: string): Promise<DepartmentType | null> {
        return this.departmentTypeRepository.findOne({
            where: { id, deletedAt: IsNull() },
        });
    }

    async findByCode(typeCode: string): Promise<DepartmentType | null> {
        return this.departmentTypeRepository.findOne({
            where: { typeCode, deletedAt: IsNull() },
        });
    }

    async save(departmentType: DepartmentType): Promise<DepartmentType> {
        return this.departmentTypeRepository.save(departmentType);
    }

    async delete(id: string): Promise<void> {
        await this.departmentTypeRepository.softDelete(id);
    }

    async softDelete(id: string): Promise<void> {
        await this.departmentTypeRepository.softDelete(id);
    }

    // ========== QUERY OPERATIONS ==========

    async findAll(): Promise<DepartmentType[]> {
        return this.departmentTypeRepository.find({
            where: { deletedAt: IsNull() },
            order: { sortOrder: 'ASC', typeName: 'ASC' },
        });
    }

    async findActive(): Promise<DepartmentType[]> {
        return this.departmentTypeRepository.find({
            where: { isActive: true, deletedAt: IsNull() },
            order: { sortOrder: 'ASC', typeName: 'ASC' },
        });
    }

    async findInactive(): Promise<DepartmentType[]> {
        return this.departmentTypeRepository.find({
            where: { isActive: false, deletedAt: IsNull() },
            order: { sortOrder: 'ASC', typeName: 'ASC' },
        });
    }

    async findBySortOrder(): Promise<DepartmentType[]> {
        return this.departmentTypeRepository.find({
            where: { deletedAt: IsNull() },
            order: { sortOrder: 'ASC', typeName: 'ASC' },
        });
    }

    // ========== SEARCH OPERATIONS ==========

    async searchByName(name: string): Promise<DepartmentType[]> {
        return this.departmentTypeRepository.find({
            where: {
                typeName: Like(`%${name}%`),
                deletedAt: IsNull()
            },
            order: { sortOrder: 'ASC', typeName: 'ASC' },
        });
    }

    async searchByCode(code: string): Promise<DepartmentType[]> {
        return this.departmentTypeRepository.find({
            where: {
                typeCode: Like(`%${code}%`),
                deletedAt: IsNull()
            },
            order: { sortOrder: 'ASC', typeName: 'ASC' },
        });
    }

    async searchByKeyword(keyword: string): Promise<DepartmentType[]> {
        return this.departmentTypeRepository.find({
            where: [
                { typeCode: Like(`%${keyword}%`), deletedAt: IsNull() },
                { typeName: Like(`%${keyword}%`), deletedAt: IsNull() },
                { description: Like(`%${keyword}%`), deletedAt: IsNull() },
            ],
            order: { sortOrder: 'ASC', typeName: 'ASC' },
        });
    }

    // ========== PAGINATION OPERATIONS ==========

    async findWithPagination(
        limit: number,
        offset: number,
        sortBy?: string,
        sortOrder?: 'ASC' | 'DESC',
        filters?: {
            isActive?: boolean;
            search?: string;
        }
    ): Promise<[DepartmentType[], number]> {
        const queryBuilder = this.departmentTypeRepository
            .createQueryBuilder('departmentType')
            .where('departmentType.deletedAt IS NULL')
            .orderBy(`departmentType.${sortBy || 'sortOrder'}`, sortOrder || 'ASC')
            .limit(limit)
            .offset(offset);

        // Apply filters
        if (filters?.isActive !== undefined) {
            queryBuilder.andWhere('departmentType.isActive = :isActive', { isActive: filters.isActive });
        }

        if (filters?.search) {
            queryBuilder.andWhere(
                '(departmentType.typeCode ILIKE :search OR departmentType.typeName ILIKE :search OR departmentType.description ILIKE :search)',
                { search: `%${filters.search}%` }
            );
        }

        return queryBuilder.getManyAndCount();
    }

    // ========== BULK OPERATIONS ==========

    async findByIds(ids: string[]): Promise<DepartmentType[]> {
        return this.departmentTypeRepository.find({
            where: { id: In(ids), deletedAt: IsNull() },
            order: { sortOrder: 'ASC', typeName: 'ASC' },
        });
    }

    async saveMany(departmentTypes: DepartmentType[]): Promise<DepartmentType[]> {
        return this.departmentTypeRepository.save(departmentTypes);
    }

    async deleteMany(ids: string[]): Promise<void> {
        await this.departmentTypeRepository.softDelete(ids);
    }

    // ========== STATISTICS OPERATIONS ==========

    async countTotal(): Promise<number> {
        return this.departmentTypeRepository.count({
            where: { deletedAt: IsNull() },
        });
    }

    async countActive(): Promise<number> {
        return this.departmentTypeRepository.count({
            where: { isActive: true, deletedAt: IsNull() },
        });
    }

    async countInactive(): Promise<number> {
        return this.departmentTypeRepository.count({
            where: { isActive: false, deletedAt: IsNull() },
        });
    }

    async countByStatus(isActive: boolean): Promise<number> {
        return this.departmentTypeRepository.count({
            where: { isActive, deletedAt: IsNull() },
        });
    }

    // ========== VALIDATION OPERATIONS ==========

    async existsByCode(typeCode: string, excludeId?: string): Promise<boolean> {
        const queryBuilder = this.departmentTypeRepository
            .createQueryBuilder('departmentType')
            .where('departmentType.typeCode = :typeCode', { typeCode })
            .andWhere('departmentType.deletedAt IS NULL');

        if (excludeId) {
            queryBuilder.andWhere('departmentType.id != :excludeId', { excludeId });
        }

        const count = await queryBuilder.getCount();
        return count > 0;
    }

    async existsByName(typeName: string, excludeId?: string): Promise<boolean> {
        const queryBuilder = this.departmentTypeRepository
            .createQueryBuilder('departmentType')
            .where('departmentType.typeName = :typeName', { typeName })
            .andWhere('departmentType.deletedAt IS NULL');

        if (excludeId) {
            queryBuilder.andWhere('departmentType.id != :excludeId', { excludeId });
        }

        const count = await queryBuilder.getCount();
        return count > 0;
    }

    // ========== UTILITY OPERATIONS ==========

    async getNextSortOrder(): Promise<number> {
        const result = await this.departmentTypeRepository
            .createQueryBuilder('departmentType')
            .select('MAX(departmentType.sortOrder)', 'maxSortOrder')
            .where('departmentType.deletedAt IS NULL')
            .getRawOne();

        return (result?.maxSortOrder || 0) + 1;
    }

    async getMaxSortOrder(): Promise<number> {
        const result = await this.departmentTypeRepository
            .createQueryBuilder('departmentType')
            .select('MAX(departmentType.sortOrder)', 'maxSortOrder')
            .where('departmentType.deletedAt IS NULL')
            .getRawOne();

        return result?.maxSortOrder || 0;
    }

    async reorderSortOrder(): Promise<void> {
        const departmentTypes = await this.departmentTypeRepository.find({
            where: { deletedAt: IsNull() },
            order: { sortOrder: 'ASC', createdAt: 'ASC' },
        });

        for (let i = 0; i < departmentTypes.length; i++) {
            departmentTypes[i].sortOrder = i + 1;
        }

        await this.departmentTypeRepository.save(departmentTypes);
    }
}
