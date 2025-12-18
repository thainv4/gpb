import { Branch } from '../entities/branch.entity';

export interface IBranchRepository {
    // ========== BASIC CRUD OPERATIONS ==========
    findById(id: string): Promise<Branch | null>;
    findByCode(branchCode: string): Promise<Branch | null>;
    save(branch: Branch): Promise<Branch>;
    delete(id: string): Promise<void>;
    softDelete(id: string): Promise<void>;

    // ========== QUERY OPERATIONS ==========
    findAll(): Promise<Branch[]>;
    findActive(): Promise<Branch[]>;
    findInactive(): Promise<Branch[]>;

    // ========== PROVINCE-RELATED OPERATIONS ==========
    findByProvinceId(provinceId: string): Promise<Branch[]>;
    findActiveByProvinceId(provinceId: string): Promise<Branch[]>;
    findByProvinceCode(provinceCode: string): Promise<Branch[]>;
    findActiveByProvinceCode(provinceCode: string): Promise<Branch[]>;

    // ========== WARD-RELATED OPERATIONS ==========
    findByWardId(wardId: string): Promise<Branch[]>;
    findActiveByWardId(wardId: string): Promise<Branch[]>;
    findByWardCode(wardCode: string): Promise<Branch[]>;
    findActiveByWardCode(wardCode: string): Promise<Branch[]>;

    // ========== LOCATION-RELATED OPERATIONS ==========
    findByProvinceAndWard(provinceId: string, wardId: string): Promise<Branch[]>;
    findActiveByProvinceAndWard(provinceId: string, wardId: string): Promise<Branch[]>;

    // ========== SEARCH OPERATIONS ==========
    searchByName(name: string): Promise<Branch[]>;
    searchByCode(code: string): Promise<Branch[]>;
    searchByShortName(shortName: string): Promise<Branch[]>;
    searchByAddress(address: string): Promise<Branch[]>;
    searchByPhoneNumber(phoneNumber: string): Promise<Branch[]>;
    searchByRepresentative(representative: string): Promise<Branch[]>;
    searchByBhyCode(bhyCode: string): Promise<Branch[]>;
    searchByHospitalLevel(hospitalLevel: string): Promise<Branch[]>;
    searchByKeyword(keyword: string): Promise<Branch[]>;
    searchByProvinceAndKeyword(provinceId: string, keyword: string): Promise<Branch[]>;
    searchByWardAndKeyword(wardId: string, keyword: string): Promise<Branch[]>;

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
            wardId?: string;
            hospitalLevel?: string;
        }
    ): Promise<[Branch[], number]>;

    // ========== BULK OPERATIONS ==========
    findByIds(ids: string[]): Promise<Branch[]>;
    findByProvinceIds(provinceIds: string[]): Promise<Branch[]>;
    findByWardIds(wardIds: string[]): Promise<Branch[]>;
    saveMany(branches: Branch[]): Promise<Branch[]>;
    deleteMany(ids: string[]): Promise<void>;

    // ========== STATISTICS OPERATIONS ==========
    countTotal(): Promise<number>;
    countActive(): Promise<number>;
    countInactive(): Promise<number>;
    countByStatus(isActive: boolean): Promise<number>;
    countByProvince(provinceId: string): Promise<number>;
    countActiveByProvince(provinceId: string): Promise<number>;
    countByWard(wardId: string): Promise<number>;
    countActiveByWard(wardId: string): Promise<number>;
    countByHospitalLevel(hospitalLevel: string): Promise<number>;
    countActiveByHospitalLevel(hospitalLevel: string): Promise<number>;

    // ========== VALIDATION OPERATIONS ==========
    existsByCode(branchCode: string, excludeId?: string): Promise<boolean>;
    existsByName(branchName: string, excludeId?: string): Promise<boolean>;
    existsByShortName(shortName: string, excludeId?: string): Promise<boolean>;
    existsByBhyCode(bhyCode: string, excludeId?: string): Promise<boolean>;
    existsByPhoneNumber(phoneNumber: string, excludeId?: string): Promise<boolean>;
    existsByNameInProvince(branchName: string, provinceId: string, excludeId?: string): Promise<boolean>;
    existsByShortNameInProvince(shortName: string, provinceId: string, excludeId?: string): Promise<boolean>;
    existsByNameInWard(branchName: string, wardId: string, excludeId?: string): Promise<boolean>;
    existsByShortNameInWard(shortName: string, wardId: string, excludeId?: string): Promise<boolean>;

    // ========== UTILITY OPERATIONS ==========
    getNextBranchCode(provinceCode: string): Promise<string>;
    getMaxBranchCode(provinceCode: string): Promise<string>;
    reorderBranches(provinceId?: string, wardId?: string): Promise<void>;
}
