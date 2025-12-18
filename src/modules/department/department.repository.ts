import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Like, In, Not } from 'typeorm';
import { Department } from './entities/department.entity';
import { IDepartmentRepository } from './interfaces/department.repository.interface';

@Injectable()
export class DepartmentRepository implements IDepartmentRepository {
    constructor(
        @InjectRepository(Department)
        private readonly departmentRepository: Repository<Department>,
    ) { }

    async findById(id: string): Promise<Department | null> {
        return this.departmentRepository.findOne({
            where: { id: id, deletedAt: IsNull() },
            relations: ['branch', 'departmentType', 'parent', 'children'],
        });
    }

    async findByCode(departmentCode: string): Promise<Department | null> {
        return this.departmentRepository.findOne({
            where: { departmentCode: departmentCode, deletedAt: IsNull() },
            relations: ['branch', 'departmentType', 'parent', 'children'],
        });
    }

    async save(department: Department): Promise<Department> {
        return this.departmentRepository.save(department);
    }

    async delete(id: string): Promise<void> {
        await this.departmentRepository.delete(id);
    }

    async softDelete(id: string): Promise<void> {
        await this.departmentRepository.softDelete(id);
    }

    async findAll(): Promise<Department[]> {
        return this.departmentRepository.find({
            where: { deletedAt: IsNull() },
            relations: ['branch', 'departmentType', 'parent'],
            order: { sortOrder: 'ASC', departmentName: 'ASC' },
        });
    }

    async findActive(): Promise<Department[]> {
        return this.departmentRepository.find({
            where: { isActive: true, deletedAt: IsNull() },
            relations: ['branch', 'departmentType', 'parent'],
            order: { sortOrder: 'ASC', departmentName: 'ASC' },
        });
    }

    async findInactive(): Promise<Department[]> {
        return this.departmentRepository.find({
            where: { isActive: false, deletedAt: IsNull() },
            relations: ['branch', 'departmentType', 'parent'],
            order: { sortOrder: 'ASC', departmentName: 'ASC' },
        });
    }

    async findByIds(ids: string[]): Promise<Department[]> {
        return this.departmentRepository.find({
            where: { id: In(ids), deletedAt: IsNull() },
            relations: ['branch', 'departmentType', 'parent'],
            order: { sortOrder: 'ASC', departmentName: 'ASC' },
        });
    }

    async findRootDepartments(): Promise<Department[]> {
        return this.departmentRepository.find({
            where: { parentDepartmentId: IsNull(), deletedAt: IsNull() },
            relations: ['branch', 'departmentType', 'children'],
            order: { sortOrder: 'ASC', departmentName: 'ASC' },
        });
    }

    async findChildrenByParentId(parentId: string): Promise<Department[]> {
        return this.departmentRepository.find({
            where: { parentDepartmentId: parentId, deletedAt: IsNull() },
            relations: ['branch', 'departmentType', 'parent', 'children'],
            order: { sortOrder: 'ASC', departmentName: 'ASC' },
        });
    }

    async findDescendantsByParentId(parentId: string): Promise<Department[]> {
        // This is a simplified implementation. For complex hierarchies,
        // you might want to use a recursive CTE or a more sophisticated approach
        const children = await this.findChildrenByParentId(parentId);
        const descendants: Department[] = [...children];

        for (const child of children) {
            const grandChildren = await this.findDescendantsByParentId(child.id);
            descendants.push(...grandChildren);
        }

        return descendants;
    }

    async findAncestorsByDepartmentId(departmentId: string): Promise<Department[]> {
        const department = await this.findById(departmentId);
        if (!department || !department.parentDepartmentId) {
            return [];
        }

        const ancestors: Department[] = [];
        let currentParentId = department.parentDepartmentId;

        while (currentParentId) {
            const parent = await this.findById(currentParentId);
            if (parent) {
                ancestors.push(parent);
                currentParentId = parent.parentDepartmentId;
            } else {
                break;
            }
        }

        return ancestors;
    }

    async findByBranchId(branchId: string): Promise<Department[]> {
        return this.departmentRepository.find({
            where: { branchId: branchId, deletedAt: IsNull() },
            relations: ['branch', 'departmentType', 'parent'],
            order: { sortOrder: 'ASC', departmentName: 'ASC' },
        });
    }

    async findByDepartmentTypeId(departmentTypeId: string): Promise<Department[]> {
        return this.departmentRepository.find({
            where: { departmentTypeId: departmentTypeId, deletedAt: IsNull() },
            relations: ['branch', 'departmentType', 'parent'],
            order: { sortOrder: 'ASC', departmentName: 'ASC' },
        });
    }

    async findByBranchIds(branchIds: string[]): Promise<Department[]> {
        return this.departmentRepository.find({
            where: { branchId: In(branchIds), deletedAt: IsNull() },
            relations: ['branch', 'departmentType', 'parent'],
            order: { sortOrder: 'ASC', departmentName: 'ASC' },
        });
    }

    async findByDepartmentTypeIds(departmentTypeIds: string[]): Promise<Department[]> {
        return this.departmentRepository.find({
            where: { departmentTypeId: In(departmentTypeIds), deletedAt: IsNull() },
            relations: ['branch', 'departmentType', 'parent'],
            order: { sortOrder: 'ASC', departmentName: 'ASC' },
        });
    }

    async searchByKeyword(keyword: string): Promise<Department[]> {
        return this.departmentRepository.find({
            where: [
                { departmentCode: Like(`%${keyword}%`), deletedAt: IsNull() },
                { departmentName: Like(`%${keyword}%`), deletedAt: IsNull() },
                { shortName: Like(`%${keyword}%`), deletedAt: IsNull() },
                { headOfDepartment: Like(`%${keyword}%`), deletedAt: IsNull() },
                { headNurse: Like(`%${keyword}%`), deletedAt: IsNull() },
            ],
            relations: ['branch', 'departmentType', 'parent'],
            order: { sortOrder: 'ASC', departmentName: 'ASC' },
        });
    }

    async searchByHeadOfDepartment(headOfDepartment: string): Promise<Department[]> {
        return this.departmentRepository.find({
            where: { headOfDepartment: Like(`%${headOfDepartment}%`), deletedAt: IsNull() },
            relations: ['branch', 'departmentType', 'parent'],
            order: { sortOrder: 'ASC', departmentName: 'ASC' },
        });
    }

    async searchByHeadNurse(headNurse: string): Promise<Department[]> {
        return this.departmentRepository.find({
            where: { headNurse: Like(`%${headNurse}%`), deletedAt: IsNull() },
            relations: ['branch', 'departmentType', 'parent'],
            order: { sortOrder: 'ASC', departmentName: 'ASC' },
        });
    }

    async findWithPagination(
        limit: number,
        offset: number,
        sortBy?: string,
        sortOrder?: 'ASC' | 'DESC',
        filters?: {
            isActive?: boolean;
            branchId?: string;
            departmentTypeId?: string;
            parentDepartmentId?: string;
            search?: string;
        }
    ): Promise<[Department[], number]> {
        const queryBuilder = this.departmentRepository.createQueryBuilder('department');
        queryBuilder.leftJoinAndSelect('department.branch', 'branch');
        queryBuilder.leftJoinAndSelect('department.departmentType', 'departmentType');
        queryBuilder.leftJoinAndSelect('department.parent', 'parent');
        queryBuilder.where('department.deletedAt IS NULL');

        if (filters?.isActive !== undefined) {
            queryBuilder.andWhere('department.isActive = :isActive', { isActive: filters.isActive });
        }

        if (filters?.branchId) {
            queryBuilder.andWhere('department.branchId = :branchId', { branchId: filters.branchId });
        }

        if (filters?.departmentTypeId) {
            queryBuilder.andWhere('department.departmentTypeId = :departmentTypeId', { departmentTypeId: filters.departmentTypeId });
        }

        if (filters?.parentDepartmentId !== undefined) {
            if (filters.parentDepartmentId === null) {
                queryBuilder.andWhere('department.parentDepartmentId IS NULL');
            } else {
                queryBuilder.andWhere('department.parentDepartmentId = :parentDepartmentId', { parentDepartmentId: filters.parentDepartmentId });
            }
        }

        if (filters?.search) {
            queryBuilder.andWhere(
                '(department.departmentCode LIKE :search OR department.departmentName LIKE :search OR department.shortName LIKE :search OR department.headOfDepartment LIKE :search OR department.headNurse LIKE :search)',
                { search: `%${filters.search}%` }
            );
        }

        if (sortBy) {
            queryBuilder.orderBy(`department.${sortBy}`, sortOrder);
        } else {
            queryBuilder.orderBy('department.sortOrder', 'ASC');
            queryBuilder.addOrderBy('department.departmentName', 'ASC');
        }

        queryBuilder.skip(offset).take(limit);

        return queryBuilder.getManyAndCount();
    }

    async countTotal(): Promise<number> {
        return this.departmentRepository.count({ where: { deletedAt: IsNull() } });
    }

    async countActive(): Promise<number> {
        return this.departmentRepository.count({ where: { isActive: true, deletedAt: IsNull() } });
    }

    async countInactive(): Promise<number> {
        return this.departmentRepository.count({ where: { isActive: false, deletedAt: IsNull() } });
    }

    async countByStatus(isActive: boolean): Promise<number> {
        return this.departmentRepository.count({ where: { isActive, deletedAt: IsNull() } });
    }

    async countByBranch(branchId: string): Promise<number> {
        return this.departmentRepository.count({ where: { branchId, deletedAt: IsNull() } });
    }

    async countByDepartmentType(departmentTypeId: string): Promise<number> {
        return this.departmentRepository.count({ where: { departmentTypeId, deletedAt: IsNull() } });
    }

    async countByParent(parentDepartmentId: string): Promise<number> {
        return this.departmentRepository.count({ where: { parentDepartmentId, deletedAt: IsNull() } });
    }

    async getNextSortOrder(): Promise<number> {
        const maxSortOrder = await this.departmentRepository
            .createQueryBuilder('department')
            .select('MAX(department.sortOrder)', 'maxSortOrder')
            .getRawOne();
        return (maxSortOrder.maxSortOrder || 0) + 1;
    }

    async existsByCode(departmentCode: string, excludeId?: string): Promise<boolean> {
        const query = { departmentCode: departmentCode, deletedAt: IsNull() };
        if (excludeId) {
            return this.departmentRepository.exists({ where: { ...query, id: Not(excludeId) } });
        }
        return this.departmentRepository.exists({ where: query });
    }

    async existsByName(departmentName: string, excludeId?: string): Promise<boolean> {
        const query = { departmentName: departmentName, deletedAt: IsNull() };
        if (excludeId) {
            return this.departmentRepository.exists({ where: { ...query, id: Not(excludeId) } });
        }
        return this.departmentRepository.exists({ where: query });
    }

    async existsByShortName(shortName: string, excludeId?: string): Promise<boolean> {
        const query = { shortName: shortName, deletedAt: IsNull() };
        if (excludeId) {
            return this.departmentRepository.exists({ where: { ...query, id: Not(excludeId) } });
        }
        return this.departmentRepository.exists({ where: query });
    }

    async isCircularReference(departmentId: string, parentId: string): Promise<boolean> {
        if (departmentId === parentId) {
            return true;
        }

        const ancestors = await this.findAncestorsByDepartmentId(departmentId);
        return ancestors.some(ancestor => ancestor.id === parentId);
    }

    async getMaxHierarchyDepth(): Promise<number> {
        // This is a simplified implementation. For complex hierarchies,
        // you might want to use a recursive CTE or a more sophisticated approach
        const departments = await this.findAll();
        let maxDepth = 0;

        for (const dept of departments) {
            const depth = dept.getHierarchyLevel();
            if (depth > maxDepth) {
                maxDepth = depth;
            }
        }

        return maxDepth;
    }
}
