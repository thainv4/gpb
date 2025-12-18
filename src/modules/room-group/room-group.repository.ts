import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Like, In, Not } from 'typeorm';
import { RoomGroup } from './entities/room-group.entity';
import { IRoomGroupRepository } from './interfaces/room-group.repository.interface';

@Injectable()
export class RoomGroupRepository implements IRoomGroupRepository {
    constructor(
        @InjectRepository(RoomGroup)
        private readonly roomGroupRepository: Repository<RoomGroup>,
    ) {}

    async findById(id: string): Promise<RoomGroup | null> {
        return this.roomGroupRepository.findOne({
            where: { id: id, deletedAt: IsNull() },
        });
    }

    async findByCode(roomGroupCode: string): Promise<RoomGroup | null> {
        return this.roomGroupRepository.findOne({
            where: { roomGroupCode: roomGroupCode, deletedAt: IsNull() },
        });
    }

    async save(roomGroup: RoomGroup): Promise<RoomGroup> {
        return this.roomGroupRepository.save(roomGroup);
    }

    async delete(id: string): Promise<void> {
        await this.roomGroupRepository.delete(id);
    }

    async softDelete(id: string): Promise<void> {
        await this.roomGroupRepository.softDelete(id);
    }

    async findAll(): Promise<RoomGroup[]> {
        return this.roomGroupRepository.find({
            where: { deletedAt: IsNull() },
            order: { sortOrder: 'ASC', roomGroupName: 'ASC' },
        });
    }

    async findActive(): Promise<RoomGroup[]> {
        return this.roomGroupRepository.find({
            where: { isActive: true, deletedAt: IsNull() },
            order: { sortOrder: 'ASC', roomGroupName: 'ASC' },
        });
    }

    async findInactive(): Promise<RoomGroup[]> {
        return this.roomGroupRepository.find({
            where: { isActive: false, deletedAt: IsNull() },
            order: { sortOrder: 'ASC', roomGroupName: 'ASC' },
        });
    }

    async findByIds(ids: string[]): Promise<RoomGroup[]> {
        return this.roomGroupRepository.find({
            where: { id: In(ids), deletedAt: IsNull() },
            order: { sortOrder: 'ASC', roomGroupName: 'ASC' },
        });
    }

    async searchByKeyword(keyword: string): Promise<RoomGroup[]> {
        return this.roomGroupRepository.find({
            where: [
                { roomGroupCode: Like(`%${keyword}%`), deletedAt: IsNull() },
                { roomGroupName: Like(`%${keyword}%`), deletedAt: IsNull() },
            ],
            order: { sortOrder: 'ASC', roomGroupName: 'ASC' },
        });
    }

    async findWithPagination(
        limit: number,
        offset: number,
        sortBy?: string,
        sortOrder?: 'ASC' | 'DESC',
        filters?: {
            isActive?: boolean;
            search?: string;
        }
    ): Promise<[RoomGroup[], number]> {
        const queryBuilder = this.roomGroupRepository.createQueryBuilder('roomGroup');
        queryBuilder.where('roomGroup.deletedAt IS NULL');

        if (filters?.isActive !== undefined) {
            queryBuilder.andWhere('roomGroup.isActive = :isActive', { isActive: filters.isActive });
        }

        if (filters?.search) {
            queryBuilder.andWhere(
                '(roomGroup.roomGroupCode LIKE :search OR roomGroup.roomGroupName LIKE :search)',
                { search: `%${filters.search}%` }
            );
        }

        if (sortBy) {
            queryBuilder.orderBy(`roomGroup.${sortBy}`, sortOrder);
        } else {
            queryBuilder.orderBy('roomGroup.sortOrder', 'ASC');
            queryBuilder.addOrderBy('roomGroup.roomGroupName', 'ASC');
        }

        queryBuilder.skip(offset).take(limit);

        return queryBuilder.getManyAndCount();
    }

    async countTotal(): Promise<number> {
        return this.roomGroupRepository.count({ where: { deletedAt: IsNull() } });
    }

    async countActive(): Promise<number> {
        return this.roomGroupRepository.count({ where: { isActive: true, deletedAt: IsNull() } });
    }

    async countInactive(): Promise<number> {
        return this.roomGroupRepository.count({ where: { isActive: false, deletedAt: IsNull() } });
    }

    async countByStatus(isActive: boolean): Promise<number> {
        return this.roomGroupRepository.count({ where: { isActive, deletedAt: IsNull() } });
    }

    async getNextSortOrder(): Promise<number> {
        const maxSortOrder = await this.roomGroupRepository
            .createQueryBuilder('roomGroup')
            .select('MAX(roomGroup.sortOrder)', 'maxSortOrder')
            .getRawOne();
        return (maxSortOrder.maxSortOrder || 0) + 1;
    }

    async existsByCode(roomGroupCode: string, excludeId?: string): Promise<boolean> {
        const query = { roomGroupCode: roomGroupCode, deletedAt: IsNull() };
        if (excludeId) {
            return this.roomGroupRepository.exists({ where: { ...query, id: Not(excludeId) } });
        }
        return this.roomGroupRepository.exists({ where: query });
    }

    async existsByName(roomGroupName: string, excludeId?: string): Promise<boolean> {
        const query = { roomGroupName: roomGroupName, deletedAt: IsNull() };
        if (excludeId) {
            return this.roomGroupRepository.exists({ where: { ...query, id: Not(excludeId) } });
        }
        return this.roomGroupRepository.exists({ where: query });
    }
}
