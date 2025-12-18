import { Injectable } from '@nestjs/common';
import { Repository, IsNull, Like, In, Not } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from './entities/branch.entity';
import { IBranchRepository } from './interfaces/branch.repository.interface';

@Injectable()
export class BranchRepository implements IBranchRepository {
    constructor(
        @InjectRepository(Branch)
        private readonly branchRepository: Repository<Branch>,
    ) { }

    // ========== BASIC CRUD OPERATIONS ==========
    async findById(id: string): Promise<Branch | null> {
        return this.branchRepository.findOne({
            where: { id, deletedAt: IsNull() },
            relations: ['province', 'ward'],
        });
    }

    async findByCode(branchCode: string): Promise<Branch | null> {
        return this.branchRepository.findOne({
            where: { branchCode, deletedAt: IsNull() },
            relations: ['province', 'ward'],
        });
    }

    async save(branch: Branch): Promise<Branch> {
        return this.branchRepository.save(branch);
    }

    async delete(id: string): Promise<void> {
        await this.branchRepository.delete(id);
    }

    async softDelete(id: string): Promise<void> {
        await this.branchRepository.update(id, {
            deletedAt: new Date(),
        });
    }

    // ========== QUERY OPERATIONS ==========
    async findAll(): Promise<Branch[]> {
        return this.branchRepository.find({
            where: { deletedAt: IsNull() },
            relations: ['province', 'ward'],
            order: { branchName: 'ASC' },
        });
    }

    async findActive(): Promise<Branch[]> {
        return this.branchRepository.find({
            where: { isActive: true, deletedAt: IsNull() },
            relations: ['province', 'ward'],
            order: { branchName: 'ASC' },
        });
    }

    async findInactive(): Promise<Branch[]> {
        return this.branchRepository.find({
            where: { isActive: false, deletedAt: IsNull() },
            relations: ['province', 'ward'],
            order: { branchName: 'ASC' },
        });
    }

    // ========== PROVINCE-RELATED OPERATIONS ==========
    async findByProvinceId(provinceId: string): Promise<Branch[]> {
        return this.branchRepository.find({
            where: { provinceId, deletedAt: IsNull() },
            relations: ['province', 'ward'],
            order: { branchName: 'ASC' },
        });
    }

    async findActiveByProvinceId(provinceId: string): Promise<Branch[]> {
        return this.branchRepository.find({
            where: { provinceId, isActive: true, deletedAt: IsNull() },
            relations: ['province', 'ward'],
            order: { branchName: 'ASC' },
        });
    }

    async findByProvinceCode(provinceCode: string): Promise<Branch[]> {
        return this.branchRepository
            .createQueryBuilder('branch')
            .leftJoinAndSelect('branch.province', 'province')
            .leftJoinAndSelect('branch.ward', 'ward')
            .where('branch.deletedAt IS NULL')
            .andWhere('province.provinceCode = :provinceCode', { provinceCode })
            .orderBy('branch.branchName', 'ASC')
            .getMany();
    }

    async findActiveByProvinceCode(provinceCode: string): Promise<Branch[]> {
        return this.branchRepository
            .createQueryBuilder('branch')
            .leftJoinAndSelect('branch.province', 'province')
            .leftJoinAndSelect('branch.ward', 'ward')
            .where('branch.deletedAt IS NULL')
            .andWhere('branch.isActive = :isActive', { isActive: true })
            .andWhere('province.provinceCode = :provinceCode', { provinceCode })
            .orderBy('branch.branchName', 'ASC')
            .getMany();
    }

    // ========== WARD-RELATED OPERATIONS ==========
    async findByWardId(wardId: string): Promise<Branch[]> {
        return this.branchRepository.find({
            where: { wardId, deletedAt: IsNull() },
            relations: ['province', 'ward'],
            order: { branchName: 'ASC' },
        });
    }

    async findActiveByWardId(wardId: string): Promise<Branch[]> {
        return this.branchRepository.find({
            where: { wardId, isActive: true, deletedAt: IsNull() },
            relations: ['province', 'ward'],
            order: { branchName: 'ASC' },
        });
    }

    async findByWardCode(wardCode: string): Promise<Branch[]> {
        return this.branchRepository
            .createQueryBuilder('branch')
            .leftJoinAndSelect('branch.province', 'province')
            .leftJoinAndSelect('branch.ward', 'ward')
            .where('branch.deletedAt IS NULL')
            .andWhere('ward.wardCode = :wardCode', { wardCode })
            .orderBy('branch.branchName', 'ASC')
            .getMany();
    }

    async findActiveByWardCode(wardCode: string): Promise<Branch[]> {
        return this.branchRepository
            .createQueryBuilder('branch')
            .leftJoinAndSelect('branch.province', 'province')
            .leftJoinAndSelect('branch.ward', 'ward')
            .where('branch.deletedAt IS NULL')
            .andWhere('branch.isActive = :isActive', { isActive: true })
            .andWhere('ward.wardCode = :wardCode', { wardCode })
            .orderBy('branch.branchName', 'ASC')
            .getMany();
    }

    // ========== LOCATION-RELATED OPERATIONS ==========
    async findByProvinceAndWard(provinceId: string, wardId: string): Promise<Branch[]> {
        return this.branchRepository.find({
            where: { provinceId, wardId, deletedAt: IsNull() },
            relations: ['province', 'ward'],
            order: { branchName: 'ASC' },
        });
    }

    async findActiveByProvinceAndWard(provinceId: string, wardId: string): Promise<Branch[]> {
        return this.branchRepository.find({
            where: { provinceId, wardId, isActive: true, deletedAt: IsNull() },
            relations: ['province', 'ward'],
            order: { branchName: 'ASC' },
        });
    }

    // ========== SEARCH OPERATIONS ==========
    async searchByName(name: string): Promise<Branch[]> {
        return this.branchRepository.find({
            where: {
                branchName: Like(`%${name}%`),
                deletedAt: IsNull(),
            },
            relations: ['province', 'ward'],
            order: { branchName: 'ASC' },
        });
    }

    async searchByCode(code: string): Promise<Branch[]> {
        return this.branchRepository.find({
            where: {
                branchCode: Like(`%${code}%`),
                deletedAt: IsNull(),
            },
            relations: ['province', 'ward'],
            order: { branchName: 'ASC' },
        });
    }

    async searchByShortName(shortName: string): Promise<Branch[]> {
        return this.branchRepository.find({
            where: {
                shortName: Like(`%${shortName}%`),
                deletedAt: IsNull(),
            },
            relations: ['province', 'ward'],
            order: { branchName: 'ASC' },
        });
    }

    async searchByAddress(address: string): Promise<Branch[]> {
        return this.branchRepository.find({
            where: {
                address: Like(`%${address}%`),
                deletedAt: IsNull(),
            },
            relations: ['province', 'ward'],
            order: { branchName: 'ASC' },
        });
    }

    async searchByPhoneNumber(phoneNumber: string): Promise<Branch[]> {
        return this.branchRepository.find({
            where: {
                phoneNumber: Like(`%${phoneNumber}%`),
                deletedAt: IsNull(),
            },
            relations: ['province', 'ward'],
            order: { branchName: 'ASC' },
        });
    }

    async searchByRepresentative(representative: string): Promise<Branch[]> {
        return this.branchRepository.find({
            where: {
                representative: Like(`%${representative}%`),
                deletedAt: IsNull(),
            },
            relations: ['province', 'ward'],
            order: { branchName: 'ASC' },
        });
    }

    async searchByBhyCode(bhyCode: string): Promise<Branch[]> {
        return this.branchRepository.find({
            where: {
                bhyCode: Like(`%${bhyCode}%`),
                deletedAt: IsNull(),
            },
            relations: ['province', 'ward'],
            order: { branchName: 'ASC' },
        });
    }

    async searchByHospitalLevel(hospitalLevel: string): Promise<Branch[]> {
        return this.branchRepository.find({
            where: {
                hospitalLevel: Like(`%${hospitalLevel}%`),
                deletedAt: IsNull(),
            },
            relations: ['province', 'ward'],
            order: { branchName: 'ASC' },
        });
    }

    async searchByKeyword(keyword: string): Promise<Branch[]> {
        return this.branchRepository
            .createQueryBuilder('branch')
            .leftJoinAndSelect('branch.province', 'province')
            .leftJoinAndSelect('branch.ward', 'ward')
            .where('branch.deletedAt IS NULL')
            .andWhere(
                '(branch.branchName LIKE :keyword OR branch.branchCode LIKE :keyword OR branch.shortName LIKE :keyword OR branch.address LIKE :keyword OR branch.phoneNumber LIKE :keyword OR branch.representative LIKE :keyword OR branch.bhyCode LIKE :keyword)',
                { keyword: `%${keyword}%` }
            )
            .orderBy('branch.branchName', 'ASC')
            .getMany();
    }

    async searchByProvinceAndKeyword(provinceId: string, keyword: string): Promise<Branch[]> {
        return this.branchRepository
            .createQueryBuilder('branch')
            .leftJoinAndSelect('branch.province', 'province')
            .leftJoinAndSelect('branch.ward', 'ward')
            .where('branch.deletedAt IS NULL')
            .andWhere('branch.provinceId = :provinceId', { provinceId })
            .andWhere(
                '(branch.branchName LIKE :keyword OR branch.branchCode LIKE :keyword OR branch.shortName LIKE :keyword OR branch.address LIKE :keyword OR branch.phoneNumber LIKE :keyword OR branch.representative LIKE :keyword OR branch.bhyCode LIKE :keyword)',
                { keyword: `%${keyword}%` }
            )
            .orderBy('branch.branchName', 'ASC')
            .getMany();
    }

    async searchByWardAndKeyword(wardId: string, keyword: string): Promise<Branch[]> {
        return this.branchRepository
            .createQueryBuilder('branch')
            .leftJoinAndSelect('branch.province', 'province')
            .leftJoinAndSelect('branch.ward', 'ward')
            .where('branch.deletedAt IS NULL')
            .andWhere('branch.wardId = :wardId', { wardId })
            .andWhere(
                '(branch.branchName LIKE :keyword OR branch.branchCode LIKE :keyword OR branch.shortName LIKE :keyword OR branch.address LIKE :keyword OR branch.phoneNumber LIKE :keyword OR branch.representative LIKE :keyword OR branch.bhyCode LIKE :keyword)',
                { keyword: `%${keyword}%` }
            )
            .orderBy('branch.branchName', 'ASC')
            .getMany();
    }

    // ========== PAGINATION OPERATIONS ==========
    async findWithPagination(
        limit: number,
        offset: number,
        sortBy: string = 'branchName',
        sortOrder: 'ASC' | 'DESC' = 'ASC',
        filters?: {
            isActive?: boolean;
            search?: string;
            provinceId?: string;
            wardId?: string;
            hospitalLevel?: string;
        }
    ): Promise<[Branch[], number]> {
        const queryBuilder = this.branchRepository
            .createQueryBuilder('branch')
            .leftJoinAndSelect('branch.province', 'province')
            .leftJoinAndSelect('branch.ward', 'ward')
            .where('branch.deletedAt IS NULL');

        // Apply filters
        if (filters?.isActive !== undefined) {
            queryBuilder.andWhere('branch.isActive = :isActive', { isActive: filters.isActive });
        }

        if (filters?.provinceId) {
            queryBuilder.andWhere('branch.provinceId = :provinceId', { provinceId: filters.provinceId });
        }

        if (filters?.wardId) {
            queryBuilder.andWhere('branch.wardId = :wardId', { wardId: filters.wardId });
        }

        if (filters?.hospitalLevel) {
            queryBuilder.andWhere('branch.hospitalLevel = :hospitalLevel', { hospitalLevel: filters.hospitalLevel });
        }

        if (filters?.search) {
            queryBuilder.andWhere(
                '(branch.branchName LIKE :search OR branch.branchCode LIKE :search OR branch.shortName LIKE :search OR branch.address LIKE :search OR branch.phoneNumber LIKE :search OR branch.representative LIKE :search OR branch.bhyCode LIKE :search)',
                { search: `%${filters.search}%` }
            );
        }

        // Apply sorting
        const validSortFields = ['branchName', 'branchCode', 'hospitalLevel', 'createdAt'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'branchName';
        queryBuilder.orderBy(`branch.${sortField}`, sortOrder);

        // Apply pagination
        queryBuilder.take(limit).skip(offset);

        return queryBuilder.getManyAndCount();
    }

    // ========== BULK OPERATIONS ==========
    async findByIds(ids: string[]): Promise<Branch[]> {
        return this.branchRepository.find({
            where: { id: In(ids), deletedAt: IsNull() },
            relations: ['province', 'ward'],
            order: { branchName: 'ASC' },
        });
    }

    async findByProvinceIds(provinceIds: string[]): Promise<Branch[]> {
        return this.branchRepository.find({
            where: { provinceId: In(provinceIds), deletedAt: IsNull() },
            relations: ['province', 'ward'],
            order: { branchName: 'ASC' },
        });
    }

    async findByWardIds(wardIds: string[]): Promise<Branch[]> {
        return this.branchRepository.find({
            where: { wardId: In(wardIds), deletedAt: IsNull() },
            relations: ['province', 'ward'],
            order: { branchName: 'ASC' },
        });
    }

    async saveMany(branches: Branch[]): Promise<Branch[]> {
        return this.branchRepository.save(branches);
    }

    async deleteMany(ids: string[]): Promise<void> {
        await this.branchRepository.update(
            { id: In(ids) },
            { deletedAt: new Date() }
        );
    }

    // ========== STATISTICS OPERATIONS ==========
    async countTotal(): Promise<number> {
        return this.branchRepository.count({
            where: { deletedAt: IsNull() },
        });
    }

    async countActive(): Promise<number> {
        return this.branchRepository.count({
            where: { isActive: true, deletedAt: IsNull() },
        });
    }

    async countInactive(): Promise<number> {
        return this.branchRepository.count({
            where: { isActive: false, deletedAt: IsNull() },
        });
    }

    async countByStatus(isActive: boolean): Promise<number> {
        return this.branchRepository.count({
            where: { isActive, deletedAt: IsNull() },
        });
    }

    async countByProvince(provinceId: string): Promise<number> {
        return this.branchRepository.count({
            where: { provinceId, deletedAt: IsNull() },
        });
    }

    async countActiveByProvince(provinceId: string): Promise<number> {
        return this.branchRepository.count({
            where: { provinceId, isActive: true, deletedAt: IsNull() },
        });
    }

    async countByWard(wardId: string): Promise<number> {
        return this.branchRepository.count({
            where: { wardId, deletedAt: IsNull() },
        });
    }

    async countActiveByWard(wardId: string): Promise<number> {
        return this.branchRepository.count({
            where: { wardId, isActive: true, deletedAt: IsNull() },
        });
    }

    async countByHospitalLevel(hospitalLevel: string): Promise<number> {
        return this.branchRepository.count({
            where: { hospitalLevel, deletedAt: IsNull() },
        });
    }

    async countActiveByHospitalLevel(hospitalLevel: string): Promise<number> {
        return this.branchRepository.count({
            where: { hospitalLevel, isActive: true, deletedAt: IsNull() },
        });
    }

    // ========== VALIDATION OPERATIONS ==========
    async existsByCode(branchCode: string, excludeId?: string): Promise<boolean> {
        const queryBuilder = this.branchRepository
            .createQueryBuilder('branch')
            .where('branch.branchCode = :branchCode', { branchCode })
            .andWhere('branch.deletedAt IS NULL');

        if (excludeId) {
            queryBuilder.andWhere('branch.id != :excludeId', { excludeId });
        }

        const count = await queryBuilder.getCount();
        return count > 0;
    }

    async existsByName(branchName: string, excludeId?: string): Promise<boolean> {
        const queryBuilder = this.branchRepository
            .createQueryBuilder('branch')
            .where('branch.branchName = :branchName', { branchName })
            .andWhere('branch.deletedAt IS NULL');

        if (excludeId) {
            queryBuilder.andWhere('branch.id != :excludeId', { excludeId });
        }

        const count = await queryBuilder.getCount();
        return count > 0;
    }

    async existsByShortName(shortName: string, excludeId?: string): Promise<boolean> {
        const queryBuilder = this.branchRepository
            .createQueryBuilder('branch')
            .where('branch.shortName = :shortName', { shortName })
            .andWhere('branch.deletedAt IS NULL');

        if (excludeId) {
            queryBuilder.andWhere('branch.id != :excludeId', { excludeId });
        }

        const count = await queryBuilder.getCount();
        return count > 0;
    }

    async existsByBhyCode(bhyCode: string, excludeId?: string): Promise<boolean> {
        const queryBuilder = this.branchRepository
            .createQueryBuilder('branch')
            .where('branch.bhyCode = :bhyCode', { bhyCode })
            .andWhere('branch.deletedAt IS NULL');

        if (excludeId) {
            queryBuilder.andWhere('branch.id != :excludeId', { excludeId });
        }

        const count = await queryBuilder.getCount();
        return count > 0;
    }

    async existsByPhoneNumber(phoneNumber: string, excludeId?: string): Promise<boolean> {
        const queryBuilder = this.branchRepository
            .createQueryBuilder('branch')
            .where('branch.phoneNumber = :phoneNumber', { phoneNumber })
            .andWhere('branch.deletedAt IS NULL');

        if (excludeId) {
            queryBuilder.andWhere('branch.id != :excludeId', { excludeId });
        }

        const count = await queryBuilder.getCount();
        return count > 0;
    }

    async existsByNameInProvince(branchName: string, provinceId: string, excludeId?: string): Promise<boolean> {
        const queryBuilder = this.branchRepository
            .createQueryBuilder('branch')
            .where('branch.branchName = :branchName', { branchName })
            .andWhere('branch.provinceId = :provinceId', { provinceId })
            .andWhere('branch.deletedAt IS NULL');

        if (excludeId) {
            queryBuilder.andWhere('branch.id != :excludeId', { excludeId });
        }

        const count = await queryBuilder.getCount();
        return count > 0;
    }

    async existsByShortNameInProvince(shortName: string, provinceId: string, excludeId?: string): Promise<boolean> {
        const queryBuilder = this.branchRepository
            .createQueryBuilder('branch')
            .where('branch.shortName = :shortName', { shortName })
            .andWhere('branch.provinceId = :provinceId', { provinceId })
            .andWhere('branch.deletedAt IS NULL');

        if (excludeId) {
            queryBuilder.andWhere('branch.id != :excludeId', { excludeId });
        }

        const count = await queryBuilder.getCount();
        return count > 0;
    }

    async existsByNameInWard(branchName: string, wardId: string, excludeId?: string): Promise<boolean> {
        const queryBuilder = this.branchRepository
            .createQueryBuilder('branch')
            .where('branch.branchName = :branchName', { branchName })
            .andWhere('branch.wardId = :wardId', { wardId })
            .andWhere('branch.deletedAt IS NULL');

        if (excludeId) {
            queryBuilder.andWhere('branch.id != :excludeId', { excludeId });
        }

        const count = await queryBuilder.getCount();
        return count > 0;
    }

    async existsByShortNameInWard(shortName: string, wardId: string, excludeId?: string): Promise<boolean> {
        const queryBuilder = this.branchRepository
            .createQueryBuilder('branch')
            .where('branch.shortName = :shortName', { shortName })
            .andWhere('branch.wardId = :wardId', { wardId })
            .andWhere('branch.deletedAt IS NULL');

        if (excludeId) {
            queryBuilder.andWhere('branch.id != :excludeId', { excludeId });
        }

        const count = await queryBuilder.getCount();
        return count > 0;
    }

    // ========== UTILITY OPERATIONS ==========
    async getNextBranchCode(provinceCode: string): Promise<string> {
        const queryBuilder = this.branchRepository
            .createQueryBuilder('branch')
            .leftJoin('branch.province', 'province')
            .where('branch.deletedAt IS NULL')
            .andWhere('province.provinceCode = :provinceCode', { provinceCode })
            .orderBy('branch.branchCode', 'DESC')
            .limit(1);

        const lastBranch = await queryBuilder.getOne();

        if (!lastBranch) {
            return `${provinceCode}001`;
        }

        const lastCode = lastBranch.branchCode;
        const lastNumber = parseInt(lastCode.substring(provinceCode.length));
        const nextNumber = lastNumber + 1;

        return `${provinceCode}${nextNumber.toString().padStart(3, '0')}`;
    }

    async getMaxBranchCode(provinceCode: string): Promise<string> {
        const queryBuilder = this.branchRepository
            .createQueryBuilder('branch')
            .leftJoin('branch.province', 'province')
            .where('branch.deletedAt IS NULL')
            .andWhere('province.provinceCode = :provinceCode', { provinceCode })
            .orderBy('branch.branchCode', 'DESC')
            .limit(1);

        const lastBranch = await queryBuilder.getOne();
        return lastBranch?.branchCode || `${provinceCode}000`;
    }

    async reorderBranches(provinceId?: string, wardId?: string): Promise<void> {
        const queryBuilder = this.branchRepository
            .createQueryBuilder('branch')
            .where('branch.deletedAt IS NULL');

        if (provinceId) {
            queryBuilder.andWhere('branch.provinceId = :provinceId', { provinceId });
        }

        if (wardId) {
            queryBuilder.andWhere('branch.wardId = :wardId', { wardId });
        }

        const branches = await queryBuilder
            .orderBy('branch.branchName', 'ASC')
            .getMany();

        // No specific reordering needed for branches as they don't have sort order
        // This method is kept for consistency with other modules
    }
}
