import { DepartmentType } from '../entities/department-type.entity';

export interface IDepartmentTypeRepository {
    // ========== BASIC CRUD OPERATIONS ==========
    findById(id: string): Promise<DepartmentType | null>;
    findByCode(typeCode: string): Promise<DepartmentType | null>;
    save(departmentType: DepartmentType): Promise<DepartmentType>;
    delete(id: string): Promise<void>;
    softDelete(id: string): Promise<void>;

    // ========== QUERY OPERATIONS ==========
    findAll(): Promise<DepartmentType[]>;
    findActive(): Promise<DepartmentType[]>;
    findInactive(): Promise<DepartmentType[]>;
    findBySortOrder(): Promise<DepartmentType[]>;

    // ========== SEARCH OPERATIONS ==========
    searchByName(name: string): Promise<DepartmentType[]>;
    searchByCode(code: string): Promise<DepartmentType[]>;
    searchByKeyword(keyword: string): Promise<DepartmentType[]>;

    // ========== PAGINATION OPERATIONS ==========
    findWithPagination(
        limit: number,
        offset: number,
        sortBy?: string,
        sortOrder?: 'ASC' | 'DESC',
        filters?: {
            isActive?: boolean;
            search?: string;
        }
    ): Promise<[DepartmentType[], number]>;

    // ========== BULK OPERATIONS ==========
    findByIds(ids: string[]): Promise<DepartmentType[]>;
    saveMany(departmentTypes: DepartmentType[]): Promise<DepartmentType[]>;
    deleteMany(ids: string[]): Promise<void>;

    // ========== STATISTICS OPERATIONS ==========
    countTotal(): Promise<number>;
    countActive(): Promise<number>;
    countInactive(): Promise<number>;
    countByStatus(isActive: boolean): Promise<number>;

    // ========== VALIDATION OPERATIONS ==========
    existsByCode(typeCode: string, excludeId?: string): Promise<boolean>;
    existsByName(typeName: string, excludeId?: string): Promise<boolean>;

    // ========== UTILITY OPERATIONS ==========
    getNextSortOrder(): Promise<number>;
    getMaxSortOrder(): Promise<number>;
    reorderSortOrder(): Promise<void>;
}
