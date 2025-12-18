import { Injectable } from '@nestjs/common';
import { Repository, IsNull, Like, In, Not } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Ward } from './entities/ward.entity';
import { IWardRepository } from './interfaces/ward.repository.interface';

@Injectable()
export class WardRepository implements IWardRepository {
    constructor(
        @InjectRepository(Ward)
        private readonly wardRepository: Repository<Ward>,
    ) { }

    // ========== BASIC CRUD OPERATIONS ==========
    async findById(id: string): Promise<Ward | null> {
        return this.wardRepository.findOne({
            where: { id, deletedAt: IsNull() },
            relations: ['province'],
        });
    }

    async findByCode(wardCode: string): Promise<Ward | null> {
        return this.wardRepository.findOne({
            where: { wardCode, deletedAt: IsNull() },
            relations: ['province'],
        });
    }

    async save(ward: Ward): Promise<Ward> {
        return this.wardRepository.save(ward);
    }

    async delete(id: string): Promise<void> {
        await this.wardRepository.delete(id);
    }

    async softDelete(id: string): Promise<void> {
        await this.wardRepository.update(id, {
            deletedAt: new Date(),
        });
    }

    // ========== QUERY OPERATIONS ==========
    async findAll(): Promise<Ward[]> {
        return this.wardRepository.find({
            where: { deletedAt: IsNull() },
            relations: ['province'],
            order: { sortOrder: 'ASC', wardName: 'ASC' },
        });
    }

    async findActive(): Promise<Ward[]> {
        return this.wardRepository.find({
            where: { isActive: true, deletedAt: IsNull() },
            relations: ['province'],
            order: { sortOrder: 'ASC', wardName: 'ASC' },
        });
    }

    async findInactive(): Promise<Ward[]> {
        return this.wardRepository.find({
            where: { isActive: false, deletedAt: IsNull() },
            relations: ['province'],
            order: { sortOrder: 'ASC', wardName: 'ASC' },
        });
    }

    async findBySortOrder(): Promise<Ward[]> {
        return this.wardRepository.find({
            where: { deletedAt: IsNull() },
            relations: ['province'],
            order: { sortOrder: 'ASC' },
        });
    }

    // ========== PROVINCE-RELATED OPERATIONS ==========
    async findByProvinceId(provinceId: string): Promise<Ward[]> {
        return this.wardRepository.find({
            where: { provinceId, deletedAt: IsNull() },
            relations: ['province'],
            order: { sortOrder: 'ASC', wardName: 'ASC' },
        });
    }

    async findActiveByProvinceId(provinceId: string): Promise<Ward[]> {
        return this.wardRepository.find({
            where: { provinceId, isActive: true, deletedAt: IsNull() },
            relations: ['province'],
            order: { sortOrder: 'ASC', wardName: 'ASC' },
        });
    }

    async findByProvinceCode(provinceCode: string): Promise<Ward[]> {
        return this.wardRepository
            .createQueryBuilder('ward')
            .leftJoinAndSelect('ward.province', 'province')
            .where('ward.deletedAt IS NULL')
            .andWhere('province.provinceCode = :provinceCode', { provinceCode })
            .orderBy('ward.sortOrder', 'ASC')
            .addOrderBy('ward.wardName', 'ASC')
            .getMany();
    }

    async findActiveByProvinceCode(provinceCode: string): Promise<Ward[]> {
        return this.wardRepository
            .createQueryBuilder('ward')
            .leftJoinAndSelect('ward.province', 'province')
            .where('ward.deletedAt IS NULL')
            .andWhere('ward.isActive = :isActive', { isActive: true })
            .andWhere('province.provinceCode = :provinceCode', { provinceCode })
            .orderBy('ward.sortOrder', 'ASC')
            .addOrderBy('ward.wardName', 'ASC')
            .getMany();
    }

    // ========== SEARCH OPERATIONS ==========
    async searchByName(name: string): Promise<Ward[]> {
        return this.wardRepository.find({
            where: {
                wardName: Like(`%${name}%`),
                deletedAt: IsNull(),
            },
            relations: ['province'],
            order: { sortOrder: 'ASC', wardName: 'ASC' },
        });
    }

    async searchByCode(code: string): Promise<Ward[]> {
        return this.wardRepository.find({
            where: {
                wardCode: Like(`%${code}%`),
                deletedAt: IsNull(),
            },
            relations: ['province'],
            order: { sortOrder: 'ASC', wardName: 'ASC' },
        });
    }

    async searchByShortName(shortName: string): Promise<Ward[]> {
        return this.wardRepository.find({
            where: {
                shortName: Like(`%${shortName}%`),
                deletedAt: IsNull(),
            },
            relations: ['province'],
            order: { sortOrder: 'ASC', wardName: 'ASC' },
        });
    }

    async searchByKeyword(keyword: string): Promise<Ward[]> {
        return this.wardRepository
            .createQueryBuilder('ward')
            .leftJoinAndSelect('ward.province', 'province')
            .where('ward.deletedAt IS NULL')
            .andWhere(
                '(ward.wardName LIKE :keyword OR ward.wardCode LIKE :keyword OR ward.shortName LIKE :keyword)',
                { keyword: `%${keyword}%` }
            )
            .orderBy('ward.sortOrder', 'ASC')
            .addOrderBy('ward.wardName', 'ASC')
            .getMany();
    }

    async searchByProvinceAndKeyword(provinceId: string, keyword: string): Promise<Ward[]> {
        return this.wardRepository
            .createQueryBuilder('ward')
            .leftJoinAndSelect('ward.province', 'province')
            .where('ward.deletedAt IS NULL')
            .andWhere('ward.provinceId = :provinceId', { provinceId })
            .andWhere(
                '(ward.wardName LIKE :keyword OR ward.wardCode LIKE :keyword OR ward.shortName LIKE :keyword)',
                { keyword: `%${keyword}%` }
            )
            .orderBy('ward.sortOrder', 'ASC')
            .addOrderBy('ward.wardName', 'ASC')
            .getMany();
    }

    // ========== PAGINATION OPERATIONS ==========
    async findWithPagination(
        limit: number,
        offset: number,
        sortBy: string = 'sortOrder',
        sortOrder: 'ASC' | 'DESC' = 'ASC',
        filters?: {
            isActive?: boolean;
            search?: string;
            provinceId?: string;
        }
    ): Promise<[Ward[], number]> {
        const queryBuilder = this.wardRepository
            .createQueryBuilder('ward')
            .leftJoinAndSelect('ward.province', 'province')
            .where('ward.deletedAt IS NULL');

        // Apply filters
        if (filters?.isActive !== undefined) {
            queryBuilder.andWhere('ward.isActive = :isActive', { isActive: filters.isActive });
        }

        if (filters?.provinceId) {
            queryBuilder.andWhere('ward.provinceId = :provinceId', { provinceId: filters.provinceId });
        }

        if (filters?.search) {
            queryBuilder.andWhere(
                '(ward.wardName LIKE :search OR ward.wardCode LIKE :search OR ward.shortName LIKE :search)',
                { search: `%${filters.search}%` }
            );
        }

        // Apply sorting
        const validSortFields = ['sortOrder', 'wardName', 'wardCode', 'createdAt'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'sortOrder';
        queryBuilder.orderBy(`ward.${sortField}`, sortOrder);

        // Apply pagination
        queryBuilder.take(limit).skip(offset);

        return queryBuilder.getManyAndCount();
    }

    // ========== BULK OPERATIONS ==========
    async findByIds(ids: string[]): Promise<Ward[]> {
        return this.wardRepository.find({
            where: { id: In(ids), deletedAt: IsNull() },
            relations: ['province'],
            order: { sortOrder: 'ASC', wardName: 'ASC' },
        });
    }

    async findByProvinceIds(provinceIds: string[]): Promise<Ward[]> {
        return this.wardRepository.find({
            where: { provinceId: In(provinceIds), deletedAt: IsNull() },
            relations: ['province'],
            order: { sortOrder: 'ASC', wardName: 'ASC' },
        });
    }

    async saveMany(wards: Ward[]): Promise<Ward[]> {
        return this.wardRepository.save(wards);
    }

    async deleteMany(ids: string[]): Promise<void> {
        await this.wardRepository.update(
            { id: In(ids) },
            { deletedAt: new Date() }
        );
    }

    // ========== STATISTICS OPERATIONS ==========
    async countTotal(): Promise<number> {
        return this.wardRepository.count({
            where: { deletedAt: IsNull() },
        });
    }

    async countActive(): Promise<number> {
        return this.wardRepository.count({
            where: { isActive: true, deletedAt: IsNull() },
        });
    }

    async countInactive(): Promise<number> {
        return this.wardRepository.count({
            where: { isActive: false, deletedAt: IsNull() },
        });
    }

    async countByStatus(isActive: boolean): Promise<number> {
        return this.wardRepository.count({
            where: { isActive, deletedAt: IsNull() },
        });
    }

    async countByProvince(provinceId: string): Promise<number> {
        return this.wardRepository.count({
            where: { provinceId, deletedAt: IsNull() },
        });
    }

    async countActiveByProvince(provinceId: string): Promise<number> {
        return this.wardRepository.count({
            where: { provinceId, isActive: true, deletedAt: IsNull() },
        });
    }

    // ========== VALIDATION OPERATIONS ==========
    async existsByCode(wardCode: string, excludeId?: string): Promise<boolean> {
        const queryBuilder = this.wardRepository
            .createQueryBuilder('ward')
            .where('ward.wardCode = :wardCode', { wardCode })
            .andWhere('ward.deletedAt IS NULL');

        if (excludeId) {
            queryBuilder.andWhere('ward.id != :excludeId', { excludeId });
        }

        const count = await queryBuilder.getCount();
        return count > 0;
    }

    async existsByName(wardName: string, excludeId?: string): Promise<boolean> {
        const queryBuilder = this.wardRepository
            .createQueryBuilder('ward')
            .where('ward.wardName = :wardName', { wardName })
            .andWhere('ward.deletedAt IS NULL');

        if (excludeId) {
            queryBuilder.andWhere('ward.id != :excludeId', { excludeId });
        }

        const count = await queryBuilder.getCount();
        return count > 0;
    }

    async existsByShortName(shortName: string, excludeId?: string): Promise<boolean> {
        const queryBuilder = this.wardRepository
            .createQueryBuilder('ward')
            .where('ward.shortName = :shortName', { shortName })
            .andWhere('ward.deletedAt IS NULL');

        if (excludeId) {
            queryBuilder.andWhere('ward.id != :excludeId', { excludeId });
        }

        const count = await queryBuilder.getCount();
        return count > 0;
    }

    async existsByNameInProvince(wardName: string, provinceId: string, excludeId?: string): Promise<boolean> {
        const queryBuilder = this.wardRepository
            .createQueryBuilder('ward')
            .where('ward.wardName = :wardName', { wardName })
            .andWhere('ward.provinceId = :provinceId', { provinceId })
            .andWhere('ward.deletedAt IS NULL');

        if (excludeId) {
            queryBuilder.andWhere('ward.id != :excludeId', { excludeId });
        }

        const count = await queryBuilder.getCount();
        return count > 0;
    }

    async existsByShortNameInProvince(shortName: string, provinceId: string, excludeId?: string): Promise<boolean> {
        const queryBuilder = this.wardRepository
            .createQueryBuilder('ward')
            .where('ward.shortName = :shortName', { shortName })
            .andWhere('ward.provinceId = :provinceId', { provinceId })
            .andWhere('ward.deletedAt IS NULL');

        if (excludeId) {
            queryBuilder.andWhere('ward.id != :excludeId', { excludeId });
        }

        const count = await queryBuilder.getCount();
        return count > 0;
    }

    // ========== UTILITY OPERATIONS ==========
    async getNextSortOrder(provinceId?: string): Promise<number> {
        const queryBuilder = this.wardRepository
            .createQueryBuilder('ward')
            .select('MAX(ward.sortOrder)', 'maxSortOrder')
            .where('ward.deletedAt IS NULL');

        if (provinceId) {
            queryBuilder.andWhere('ward.provinceId = :provinceId', { provinceId });
        }

        const result = await queryBuilder.getRawOne();
        return (result?.maxSortOrder || 0) + 1;
    }

    async getMaxSortOrder(provinceId?: string): Promise<number> {
        const queryBuilder = this.wardRepository
            .createQueryBuilder('ward')
            .select('MAX(ward.sortOrder)', 'maxSortOrder')
            .where('ward.deletedAt IS NULL');

        if (provinceId) {
            queryBuilder.andWhere('ward.provinceId = :provinceId', { provinceId });
        }

        const result = await queryBuilder.getRawOne();
        return result?.maxSortOrder || 0;
    }

    async reorderSortOrder(provinceId?: string): Promise<void> {
        const queryBuilder = this.wardRepository
            .createQueryBuilder('ward')
            .where('ward.deletedAt IS NULL');

        if (provinceId) {
            queryBuilder.andWhere('ward.provinceId = :provinceId', { provinceId });
        }

        const wards = await queryBuilder
            .orderBy('ward.sortOrder', 'ASC')
            .getMany();

        const updatePromises = wards.map((ward, index) => {
            ward.sortOrder = index + 1;
            return this.save(ward);
        });

        await Promise.all(updatePromises);
    }
}
