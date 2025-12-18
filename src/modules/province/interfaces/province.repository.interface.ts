import { Province } from '../entities/province.entity';

export interface IProvinceRepository {
    // ========== BASIC CRUD OPERATIONS ==========
    findById(id: string): Promise<Province | null>;
    findByCode(provinceCode: string): Promise<Province | null>;
    save(province: Province): Promise<Province>;
    delete(id: string): Promise<void>;
    softDelete(id: string): Promise<void>;

    // ========== QUERY OPERATIONS ==========
    findAll(): Promise<Province[]>;
    findActive(): Promise<Province[]>;
    findInactive(): Promise<Province[]>;
    findBySortOrder(): Promise<Province[]>;

    // ========== SEARCH OPERATIONS ==========
    searchByName(name: string): Promise<Province[]>;
    searchByCode(code: string): Promise<Province[]>;
    searchByShortName(shortName: string): Promise<Province[]>;
    searchByKeyword(keyword: string): Promise<Province[]>;

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
    ): Promise<[Province[], number]>;

    // ========== BULK OPERATIONS ==========
    findByIds(ids: string[]): Promise<Province[]>;
    saveMany(provinces: Province[]): Promise<Province[]>;
    deleteMany(ids: string[]): Promise<void>;

    // ========== STATISTICS OPERATIONS ==========
    countTotal(): Promise<number>;
    countActive(): Promise<number>;
    countInactive(): Promise<number>;
    countByStatus(isActive: boolean): Promise<number>;

    // ========== VALIDATION OPERATIONS ==========
    existsByCode(provinceCode: string, excludeId?: string): Promise<boolean>;
    existsByName(provinceName: string, excludeId?: string): Promise<boolean>;
    existsByShortName(shortName: string, excludeId?: string): Promise<boolean>;

    // ========== UTILITY OPERATIONS ==========
    getNextSortOrder(): Promise<number>;
    getMaxSortOrder(): Promise<number>;
    reorderSortOrder(): Promise<void>;
}
