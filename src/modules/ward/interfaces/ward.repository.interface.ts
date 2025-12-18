import { Ward } from '../entities/ward.entity';

export interface IWardRepository {
    // ========== BASIC CRUD OPERATIONS ==========
    findById(id: string): Promise<Ward | null>;
    findByCode(wardCode: string): Promise<Ward | null>;
    save(ward: Ward): Promise<Ward>;
    delete(id: string): Promise<void>;
    softDelete(id: string): Promise<void>;

    // ========== QUERY OPERATIONS ==========
    findAll(): Promise<Ward[]>;
    findActive(): Promise<Ward[]>;
    findInactive(): Promise<Ward[]>;
    findBySortOrder(): Promise<Ward[]>;

    // ========== PROVINCE-RELATED OPERATIONS ==========
    findByProvinceId(provinceId: string): Promise<Ward[]>;
    findActiveByProvinceId(provinceId: string): Promise<Ward[]>;
    findByProvinceCode(provinceCode: string): Promise<Ward[]>;
    findActiveByProvinceCode(provinceCode: string): Promise<Ward[]>;

    // ========== SEARCH OPERATIONS ==========
    searchByName(name: string): Promise<Ward[]>;
    searchByCode(code: string): Promise<Ward[]>;
    searchByShortName(shortName: string): Promise<Ward[]>;
    searchByKeyword(keyword: string): Promise<Ward[]>;
    searchByProvinceAndKeyword(provinceId: string, keyword: string): Promise<Ward[]>;

    // ========== PAGINATION OPERATIONS ==========
    findWithPagination(
        limit: number,
        offset: number,
        sortBy?: string,
        sortOrder?: 'ASC' | 'DESC',
        filters?: {
            isActive?: boolean;
            search?: string;
            provinceId?: string;
        }
    ): Promise<[Ward[], number]>;

    // ========== BULK OPERATIONS ==========
    findByIds(ids: string[]): Promise<Ward[]>;
    findByProvinceIds(provinceIds: string[]): Promise<Ward[]>;
    saveMany(wards: Ward[]): Promise<Ward[]>;
    deleteMany(ids: string[]): Promise<void>;

    // ========== STATISTICS OPERATIONS ==========
    countTotal(): Promise<number>;
    countActive(): Promise<number>;
    countInactive(): Promise<number>;
    countByStatus(isActive: boolean): Promise<number>;
    countByProvince(provinceId: string): Promise<number>;
    countActiveByProvince(provinceId: string): Promise<number>;

    // ========== VALIDATION OPERATIONS ==========
    existsByCode(wardCode: string, excludeId?: string): Promise<boolean>;
    existsByName(wardName: string, excludeId?: string): Promise<boolean>;
    existsByShortName(shortName: string, excludeId?: string): Promise<boolean>;
    existsByNameInProvince(wardName: string, provinceId: string, excludeId?: string): Promise<boolean>;
    existsByShortNameInProvince(shortName: string, provinceId: string, excludeId?: string): Promise<boolean>;

    // ========== UTILITY OPERATIONS ==========
    getNextSortOrder(provinceId?: string): Promise<number>;
    getMaxSortOrder(provinceId?: string): Promise<number>;
    reorderSortOrder(provinceId?: string): Promise<void>;
}
