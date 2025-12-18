import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Like, In } from 'typeorm';
import { ServiceGroup } from './entities/service-group.entity';
import { IServiceGroupRepository } from './interfaces/service-group.repository.interface';

@Injectable()
export class ServiceGroupRepository implements IServiceGroupRepository {
    constructor(
        @InjectRepository(ServiceGroup)
        private readonly serviceGroupRepository: Repository<ServiceGroup>,
    ) {}

    async findById(id: string): Promise<ServiceGroup | null> {
        return this.serviceGroupRepository.findOne({
            where: { id, deletedAt: IsNull() },
        });
    }

    async findByCode(serviceGroupCode: string): Promise<ServiceGroup | null> {
        return this.serviceGroupRepository.findOne({
            where: { serviceGroupCode, deletedAt: IsNull() },
        });
    }

    async existsByCode(serviceGroupCode: string): Promise<boolean> {
        const count = await this.serviceGroupRepository.count({
            where: { serviceGroupCode, deletedAt: IsNull() },
        });
        return count > 0;
    }

    async save(serviceGroup: ServiceGroup): Promise<ServiceGroup> {
        return this.serviceGroupRepository.save(serviceGroup);
    }

    async delete(id: string): Promise<void> {
        await this.serviceGroupRepository.softDelete(id);
    }

    async findWithPagination(limit: number, offset: number, search?: string, isActive?: boolean): Promise<[ServiceGroup[], number]> {
        const queryBuilder = this.serviceGroupRepository
            .createQueryBuilder('serviceGroup')
            .where('serviceGroup.deletedAt IS NULL')
            .orderBy('serviceGroup.sortOrder', 'ASC')
            .addOrderBy('serviceGroup.createdAt', 'DESC')
            .limit(limit)
            .offset(offset);

        if (search) {
            queryBuilder.andWhere(
                '(serviceGroup.serviceGroupCode ILIKE :search OR serviceGroup.serviceGroupName ILIKE :search OR serviceGroup.shortName ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        if (isActive !== undefined) {
            queryBuilder.andWhere('serviceGroup.isActive = :isActive', { isActive });
        }

        return queryBuilder.getManyAndCount();
    }

    async findActiveServiceGroups(): Promise<ServiceGroup[]> {
        return this.serviceGroupRepository.find({
            where: { isActive: true, deletedAt: IsNull() },
            order: { sortOrder: 'ASC', serviceGroupName: 'ASC' },
        });
    }

    async findByMapping(mapping: string): Promise<ServiceGroup[]> {
        return this.serviceGroupRepository.find({
            where: { mapping: Like(`%${mapping}%`), deletedAt: IsNull() },
            order: { sortOrder: 'ASC' },
        });
    }

    async findByIds(ids: string[]): Promise<ServiceGroup[]> {
        if (ids.length === 0) return [];
        
        return this.serviceGroupRepository.find({
            where: { id: In(ids), deletedAt: IsNull() },
            order: { sortOrder: 'ASC' },
        });
    }

    async findByCodes(codes: string[]): Promise<ServiceGroup[]> {
        if (codes.length === 0) return [];
        
        return this.serviceGroupRepository.find({
            where: { serviceGroupCode: In(codes), deletedAt: IsNull() },
            order: { sortOrder: 'ASC' },
        });
    }

    async getNextSortOrder(): Promise<number> {
        const result = await this.serviceGroupRepository
            .createQueryBuilder('serviceGroup')
            .select('MAX(serviceGroup.sortOrder)', 'maxSortOrder')
            .where('serviceGroup.deletedAt IS NULL')
            .getRawOne();

        return (result?.maxSortOrder || 0) + 1;
    }

    async searchServiceGroups(search: string, isActive?: boolean, sortBy?: string, sortOrder?: 'ASC' | 'DESC'): Promise<ServiceGroup[]> {
        const queryBuilder = this.serviceGroupRepository
            .createQueryBuilder('serviceGroup')
            .where('serviceGroup.deletedAt IS NULL');

        if (search) {
            queryBuilder.andWhere(
                '(serviceGroup.serviceGroupCode ILIKE :search OR serviceGroup.serviceGroupName ILIKE :search OR serviceGroup.shortName ILIKE :search OR serviceGroup.description ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        if (isActive !== undefined) {
            queryBuilder.andWhere('serviceGroup.isActive = :isActive', { isActive });
        }

        // Apply sorting
        const sortField = sortBy || 'sortOrder';
        const sortDirection = sortOrder || 'ASC';
        queryBuilder.orderBy(`serviceGroup.${sortField}`, sortDirection);

        return queryBuilder.getMany();
    }
}
