import { Injectable } from '@nestjs/common';
import { DataSource, Repository, IsNull } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { IProfileRepository } from './interfaces/profile.repository.interface';

@Injectable()
export class ProfileRepository implements IProfileRepository {
    private readonly profileRepository: Repository<Profile>;

    constructor(private dataSource: DataSource) {
        this.profileRepository = this.dataSource.getRepository(Profile);
    }

    async findById(id: string): Promise<Profile | null> {
        return this.profileRepository.findOne({
            where: { id, deletedAt: IsNull() },
        });
    }

    async findByUserId(userId: string): Promise<Profile | null> {
        return this.profileRepository.findOne({
            where: { userId, deletedAt: IsNull() },
        });
    }

    async findByEmployeeCode(employeeCode: string): Promise<Profile | null> {
        return this.profileRepository.findOne({
            where: { employeeCode, deletedAt: IsNull() },
        });
    }

    async findByPhoneNumber(phoneNumber: string): Promise<Profile | null> {
        return this.profileRepository.findOne({
            where: { phoneNumber, deletedAt: IsNull() },
        });
    }

    async existsByUserId(userId: string): Promise<boolean> {
        const count = await this.profileRepository.count({
            where: { userId, deletedAt: IsNull() },
        });
        return count > 0;
    }

    async existsByEmployeeCode(employeeCode: string): Promise<boolean> {
        const count = await this.profileRepository.count({
            where: { employeeCode, deletedAt: IsNull() },
        });
        return count > 0;
    }

    async save(profile: Profile): Promise<Profile> {
        return this.profileRepository.save(profile);
    }

    async delete(id: string): Promise<void> {
        await this.profileRepository.softDelete(id);
    }

    async findWithPagination(
        limit: number,
        offset: number,
        search?: string,
        provinceId?: string,
        wardId?: string,
        departmentId?: string,
        sortBy: string = 'createdAt',
        sortOrder: 'ASC' | 'DESC' = 'DESC'
    ): Promise<[Profile[], number]> {
        const queryBuilder = this.profileRepository.createQueryBuilder('profile');

        if (search) {
            queryBuilder.andWhere(
                '(profile.position LIKE :search OR profile.employeeCode LIKE :search OR profile.phoneNumber LIKE :search)',
                { search: `%${search}%` }
            );
        }

        if (provinceId) {
            queryBuilder.andWhere('profile.provinceId = :provinceId', { provinceId });
        }

        if (wardId) {
            queryBuilder.andWhere('profile.wardId = :wardId', { wardId });
        }

        if (departmentId) {
            queryBuilder.andWhere('profile.departmentId = :departmentId', { departmentId });
        }

        queryBuilder.andWhere('profile.deletedAt IS NULL');

        queryBuilder
            .orderBy(`profile.${sortBy}`, sortOrder)
            .offset(offset)
            .limit(limit);

        return queryBuilder.getManyAndCount();
    }

    async findWithRelations(userId: string): Promise<Profile | null> {
        return this.profileRepository.findOne({
            where: { userId, deletedAt: IsNull() },
            relations: ['province', 'ward', 'department', 'user'],
        });
    }
}
