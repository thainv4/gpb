import { Profile } from '../entities/profile.entity';

export interface IProfileRepository {
    findById(id: string): Promise<Profile | null>;
    findByUserId(userId: string): Promise<Profile | null>;
    findByEmployeeCode(employeeCode: string): Promise<Profile | null>;
    findByPhoneNumber(phoneNumber: string): Promise<Profile | null>;
    existsByUserId(userId: string): Promise<boolean>;
    existsByEmployeeCode(employeeCode: string): Promise<boolean>;
    save(profile: Profile): Promise<Profile>;
    delete(id: string): Promise<void>;
    findWithPagination(
        limit: number,
        offset: number,
        search?: string,
        provinceId?: string,
        wardId?: string,
        departmentId?: string,
        sortBy?: string,
        sortOrder?: 'ASC' | 'DESC'
    ): Promise<[Profile[], number]>;
    findWithRelations(userId: string): Promise<Profile | null>;
}
