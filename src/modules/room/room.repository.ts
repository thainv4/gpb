import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Like, In } from 'typeorm';
import { Room } from './entities/room.entity';
import { IRoomRepository } from './interfaces/room.repository.interface';

@Injectable()
export class RoomRepository implements IRoomRepository {
    constructor(
        @InjectRepository(Room)
        private readonly roomRepository: Repository<Room>,
    ) { }

    // ========== BASIC CRUD OPERATIONS ==========
    async findById(id: string): Promise<Room | null> {
        return this.roomRepository.findOne({
            where: { id, deletedAt: IsNull() },
        });
    }

    async save(room: Room): Promise<Room> {
        return this.roomRepository.save(room);
    }

    async delete(id: string): Promise<void> {
        await this.roomRepository.softDelete(id);
    }

    // ========== QUERY OPERATIONS ==========
    async findAll(limit: number = 10, offset: number = 0): Promise<[Room[], number]> {
        return this.roomRepository.findAndCount({
            where: { deletedAt: IsNull() },
            take: limit,
            skip: offset,
            order: { sortOrder: 'ASC', createdAt: 'DESC' },
        });
    }

    async findByDepartmentId(departmentId: string, limit: number = 10, offset: number = 0): Promise<[Room[], number]> {
        return this.roomRepository.findAndCount({
            where: { departmentId, deletedAt: IsNull() },
            take: limit,
            skip: offset,
            order: { sortOrder: 'ASC', createdAt: 'DESC' },
        });
    }

    async findByRoomGroupId(roomGroupId: string, limit: number = 10, offset: number = 0): Promise<[Room[], number]> {
        return this.roomRepository.findAndCount({
            where: { roomGroupId, deletedAt: IsNull() },
            take: limit,
            skip: offset,
            order: { sortOrder: 'ASC', createdAt: 'DESC' },
        });
    }

    async findActive(limit: number = 10, offset: number = 0): Promise<[Room[], number]> {
        return this.roomRepository.findAndCount({
            where: { isActive: true, deletedAt: IsNull() },
            take: limit,
            skip: offset,
            order: { sortOrder: 'ASC', createdAt: 'DESC' },
        });
    }

    // ========== SEARCH OPERATIONS ==========
    async searchByCode(roomCode: string): Promise<Room[]> {
        return this.roomRepository.find({
            where: {
                roomCode: Like(`%${roomCode}%`),
                deletedAt: IsNull()
            },
            order: { sortOrder: 'ASC', createdAt: 'DESC' },
        });
    }

    async searchByName(roomName: string): Promise<Room[]> {
        return this.roomRepository.find({
            where: {
                roomName: Like(`%${roomName}%`),
                deletedAt: IsNull()
            },
            order: { sortOrder: 'ASC', createdAt: 'DESC' },
        });
    }

    async searchByAddress(address: string): Promise<Room[]> {
        return this.roomRepository.find({
            where: {
                roomAddress: Like(`%${address}%`),
                deletedAt: IsNull()
            },
            order: { sortOrder: 'ASC', createdAt: 'DESC' },
        });
    }

    async searchByDescription(description: string): Promise<Room[]> {
        return this.roomRepository.find({
            where: {
                description: Like(`%${description}%`),
                deletedAt: IsNull()
            },
            order: { sortOrder: 'ASC', createdAt: 'DESC' },
        });
    }

    // ========== VALIDATION OPERATIONS ==========
    async existsByCode(roomCode: string, excludeId?: string): Promise<boolean> {
        const query = this.roomRepository
            .createQueryBuilder('room')
            .where('room.roomCode = :roomCode', { roomCode })
            .andWhere('room.deletedAt IS NULL');

        if (excludeId) {
            query.andWhere('room.id != :excludeId', { excludeId });
        }

        const count = await query.getCount();
        return count > 0;
    }

    async existsByName(roomName: string, excludeId?: string): Promise<boolean> {
        const query = this.roomRepository
            .createQueryBuilder('room')
            .where('room.roomName = :roomName', { roomName })
            .andWhere('room.deletedAt IS NULL');

        if (excludeId) {
            query.andWhere('room.id != :excludeId', { excludeId });
        }

        const count = await query.getCount();
        return count > 0;
    }

    async existsByNameInDepartment(roomName: string, departmentId: string, excludeId?: string): Promise<boolean> {
        const query = this.roomRepository
            .createQueryBuilder('room')
            .where('room.roomName = :roomName', { roomName })
            .andWhere('room.departmentId = :departmentId', { departmentId })
            .andWhere('room.deletedAt IS NULL');

        if (excludeId) {
            query.andWhere('room.id != :excludeId', { excludeId });
        }

        const count = await query.getCount();
        return count > 0;
    }

    // ========== STATISTICS OPERATIONS ==========
    async countByDepartment(departmentId: string): Promise<number> {
        return this.roomRepository.count({
            where: { departmentId, deletedAt: IsNull() },
        });
    }

    async countByRoomGroup(roomGroupId: string): Promise<number> {
        return this.roomRepository.count({
            where: { roomGroupId, deletedAt: IsNull() },
        });
    }

    async countActive(): Promise<number> {
        return this.roomRepository.count({
            where: { isActive: true, deletedAt: IsNull() },
        });
    }

    async countTotal(): Promise<number> {
        return this.roomRepository.count({
            where: { deletedAt: IsNull() },
        });
    }

    // ========== BATCH OPERATIONS ==========
    async findByIds(ids: string[]): Promise<Room[]> {
        return this.roomRepository.find({
            where: { id: In(ids), deletedAt: IsNull() },
            order: { sortOrder: 'ASC', createdAt: 'DESC' },
        });
    }

    async findByDepartmentIds(departmentIds: string[]): Promise<Room[]> {
        return this.roomRepository.find({
            where: { departmentId: In(departmentIds), deletedAt: IsNull() },
            order: { sortOrder: 'ASC', createdAt: 'DESC' },
        });
    }

    async findByRoomGroupIds(roomGroupIds: string[]): Promise<Room[]> {
        return this.roomRepository.find({
            where: { roomGroupId: In(roomGroupIds), deletedAt: IsNull() },
            order: { sortOrder: 'ASC', createdAt: 'DESC' },
        });
    }
}
