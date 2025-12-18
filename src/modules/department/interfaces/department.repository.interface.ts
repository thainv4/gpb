import { Department } from '../entities/department.entity';

export interface IDepartmentRepository {
    // Basic CRUD operations
    findById(id: string): Promise<Department | null>;
    findByCode(departmentCode: string): Promise<Department | null>;
    save(department: Department): Promise<Department>;
    delete(id: string): Promise<void>;
    softDelete(id: string): Promise<void>;

    // Query operations
    findAll(): Promise<Department[]>;
    findActive(): Promise<Department[]>;
    findInactive(): Promise<Department[]>;
    findByIds(ids: string[]): Promise<Department[]>;

    // Hierarchy operations
    findRootDepartments(): Promise<Department[]>;
    findChildrenByParentId(parentId: string): Promise<Department[]>;
    findDescendantsByParentId(parentId: string): Promise<Department[]>;
    findAncestorsByDepartmentId(departmentId: string): Promise<Department[]>;

    // Filter by relationships
    findByBranchId(branchId: string): Promise<Department[]>;
    findByDepartmentTypeId(departmentTypeId: string): Promise<Department[]>;
    findByBranchIds(branchIds: string[]): Promise<Department[]>;
    findByDepartmentTypeIds(departmentTypeIds: string[]): Promise<Department[]>;

    // Search operations
    searchByKeyword(keyword: string): Promise<Department[]>;
    searchByHeadOfDepartment(headOfDepartment: string): Promise<Department[]>;
    searchByHeadNurse(headNurse: string): Promise<Department[]>;

    // Pagination and filtering
    findWithPagination(
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
    ): Promise<[Department[], number]>;

    // Statistics
    countTotal(): Promise<number>;
    countActive(): Promise<number>;
    countInactive(): Promise<number>;
    countByStatus(isActive: boolean): Promise<number>;
    countByBranch(branchId: string): Promise<number>;
    countByDepartmentType(departmentTypeId: string): Promise<number>;
    countByParent(parentDepartmentId: string): Promise<number>;

    // Utility methods
    getNextSortOrder(): Promise<number>;
    existsByCode(departmentCode: string, excludeId?: string): Promise<boolean>;
    existsByName(departmentName: string, excludeId?: string): Promise<boolean>;
    existsByShortName(shortName: string, excludeId?: string): Promise<boolean>;

    // Hierarchy validation
    isCircularReference(departmentId: string, parentId: string): Promise<boolean>;
    getMaxHierarchyDepth(): Promise<number>;
}
