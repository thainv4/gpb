import { Injectable, Inject } from '@nestjs/common';
import { Repository, IsNull, Like, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Province } from './entities/province.entity';
import { IProvinceRepository } from './interfaces/province.repository.interface';

@Injectable()
export class ProvinceRepository implements IProvinceRepository {
    constructor(
        @InjectRepository(Province)
        private readonly provinceRepository: Repository<Province>,
    ) { }

    // ========== BASIC CRUD OPERATIONS ==========
    async findById(id: string): Promise<Province | null> {
        return this.provinceRepository.findOne({
            where: { id, deletedAt: IsNull() },
        });
    }

    async findByCode(provinceCode: string): Promise<Province | null> {
        return this.provinceRepository.findOne({
            where: { provinceCode, deletedAt: IsNull() },
        });
    }

    async save(province: Province): Promise<Province> {
        return this.provinceRepository.save(province);
    }

    async delete(id: string): Promise<void> {
        await this.provinceRepository.delete(id);
    }

    async softDelete(id: string): Promise<void> {
        await this.provinceRepository.update(id, {
            deletedAt: new Date(),
        });
    }

    // ========== QUERY OPERATIONS ==========
    async findAll(): Promise<Province[]> {
        return this.provinceRepository.find({
            where: { deletedAt: IsNull() },
            order: { sortOrder: 'ASC', provinceName: 'ASC' },
        });
    }

    async findActive(): Promise<Province[]> {
        return this.provinceRepository.find({
            where: { isActive: true, deletedAt: IsNull() },
            order: { sortOrder: 'ASC', provinceName: 'ASC' },
        });
    }

    async findInactive(): Promise<Province[]> {
        return this.provinceRepository.find({
            where: { isActive: false, deletedAt: IsNull() },
            order: { sortOrder: 'ASC', provinceName: 'ASC' },
        });
    }

    async findBySortOrder(): Promise<Province[]> {
        return this.provinceRepository.find({
            where: { deletedAt: IsNull() },
            order: { sortOrder: 'ASC' },
        });
    }

    // ========== SEARCH OPERATIONS ==========
    async searchByName(name: string): Promise<Province[]> {
        return this.provinceRepository.find({
            where: {
                provinceName: Like(`%${name}%`),
                deletedAt: IsNull(),
            },
            order: { sortOrder: 'ASC', provinceName: 'ASC' },
        });
    }

    async searchByCode(code: string): Promise<Province[]> {
        return this.provinceRepository.find({
            where: {
                provinceCode: Like(`%${code}%`),
                deletedAt: IsNull(),
            },
            order: { sortOrder: 'ASC', provinceName: 'ASC' },
        });
    }

    async searchByShortName(shortName: string): Promise<Province[]> {
        return this.provinceRepository.find({
            where: {
                shortName: Like(`%${shortName}%`),
                deletedAt: IsNull(),
            },
            order: { sortOrder: 'ASC', provinceName: 'ASC' },
        });
    }

    async searchByKeyword(keyword: string): Promise<Province[]> {
        return this.provinceRepository
            .createQueryBuilder('province')
            .where('province.deletedAt IS NULL')
            .andWhere(
                '(province.provinceName LIKE :keyword OR province.provinceCode LIKE :keyword OR province.shortName LIKE :keyword)',
                { keyword: `%${keyword}%` }
            )
            .orderBy('province.sortOrder', 'ASC')
            .addOrderBy('province.provinceName', 'ASC')
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
        }
    ): Promise<[Province[], number]> {
        const queryBuilder = this.provinceRepository
            .createQueryBuilder('province')
            .where('province.deletedAt IS NULL');

        // Apply filters
        if (filters?.isActive !== undefined) {
            queryBuilder.andWhere('province.isActive = :isActive', { isActive: filters.isActive });
        }

        if (filters?.search) {
            queryBuilder.andWhere(
                '(province.provinceName LIKE :search OR province.provinceCode LIKE :search OR province.shortName LIKE :search)',
                { search: `%${filters.search}%` }
            );
        }

        // Apply sorting
        const validSortFields = ['sortOrder', 'provinceName', 'provinceCode', 'createdAt'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'sortOrder';
        queryBuilder.orderBy(`province.${sortField}`, sortOrder);

        // Apply pagination
        queryBuilder.take(limit).skip(offset);

        return queryBuilder.getManyAndCount();
    }

    // ========== BULK OPERATIONS ==========
    async findByIds(ids: string[]): Promise<Province[]> {
        return this.provinceRepository.find({
            where: { id: In(ids), deletedAt: IsNull() },
            order: { sortOrder: 'ASC', provinceName: 'ASC' },
        });
    }

    async saveMany(provinces: Province[]): Promise<Province[]> {
        return this.provinceRepository.save(provinces);
    }

    async deleteMany(ids: string[]): Promise<void> {
        await this.provinceRepository.update(
            { id: In(ids) },
            { deletedAt: new Date() }
        );
    }

    // ========== STATISTICS OPERATIONS ==========
    async countTotal(): Promise<number> {
        return this.provinceRepository.count({
            where: { deletedAt: IsNull() },
        });
    }

    async countActive(): Promise<number> {
        return this.provinceRepository.count({
            where: { isActive: true, deletedAt: IsNull() },
        });
    }

    async countInactive(): Promise<number> {
        return this.provinceRepository.count({
            where: { isActive: false, deletedAt: IsNull() },
        });
    }

    async countByStatus(isActive: boolean): Promise<number> {
        return this.provinceRepository.count({
            where: { isActive, deletedAt: IsNull() },
        });
    }

    // ========== VALIDATION OPERATIONS ==========
    async existsByCode(provinceCode: string, excludeId?: string): Promise<boolean> {
        const queryBuilder = this.provinceRepository
            .createQueryBuilder('province')
            .where('province.provinceCode = :provinceCode', { provinceCode })
            .andWhere('province.deletedAt IS NULL');

        if (excludeId) {
            queryBuilder.andWhere('province.id != :excludeId', { excludeId });
        }

        const count = await queryBuilder.getCount();
        return count > 0;
    }

    async existsByName(provinceName: string, excludeId?: string): Promise<boolean> {
        const queryBuilder = this.provinceRepository
            .createQueryBuilder('province')
            .where('province.provinceName = :provinceName', { provinceName })
            .andWhere('province.deletedAt IS NULL');

        if (excludeId) {
            queryBuilder.andWhere('province.id != :excludeId', { excludeId });
        }

        const count = await queryBuilder.getCount();
        return count > 0;
    }

    async existsByShortName(shortName: string, excludeId?: string): Promise<boolean> {
        const queryBuilder = this.provinceRepository
            .createQueryBuilder('province')
            .where('province.shortName = :shortName', { shortName })
            .andWhere('province.deletedAt IS NULL');

        if (excludeId) {
            queryBuilder.andWhere('province.id != :excludeId', { excludeId });
        }

        const count = await queryBuilder.getCount();
        return count > 0;
    }

    // ========== UTILITY OPERATIONS ==========
    async getNextSortOrder(): Promise<number> {
        const result = await this.provinceRepository
            .createQueryBuilder('province')
            .select('MAX(province.sortOrder)', 'maxSortOrder')
            .where('province.deletedAt IS NULL')
            .getRawOne();

        return (result?.maxSortOrder || 0) + 1;
    }

    async getMaxSortOrder(): Promise<number> {
        const result = await this.provinceRepository
            .createQueryBuilder('province')
            .select('MAX(province.sortOrder)', 'maxSortOrder')
            .where('province.deletedAt IS NULL')
            .getRawOne();

        return result?.maxSortOrder || 0;
    }

    async reorderSortOrder(): Promise<void> {
        const provinces = await this.findAll();
        const updatePromises = provinces.map((province, index) => {
            province.sortOrder = index + 1;
            return this.save(province);
        });

        await Promise.all(updatePromises);
    }
}
