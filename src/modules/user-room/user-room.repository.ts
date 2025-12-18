import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { UserRoom } from './entities/user-room.entity';
import { IUserRoomRepository } from './interfaces/user-room.repository.interface';

@Injectable()
export class UserRoomRepository implements IUserRoomRepository {
    constructor(
        @InjectRepository(UserRoom)
        private readonly userRoomRepository: Repository<UserRoom>,
    ) {}

    async findById(id: string): Promise<UserRoom | null> {
        return this.userRoomRepository.findOne({
            where: { id, deletedAt: IsNull() },
            relations: ['user', 'room', 'room.department', 'room.roomGroup'],
        });
    }

    async findByUserId(userId: string): Promise<UserRoom[]> {
        return this.userRoomRepository.find({
            where: { userId, deletedAt: IsNull() },
            relations: ['user', 'room', 'room.department', 'room.roomGroup'],
            order: { createdAt: 'DESC' },
        });
    }

    async findByRoomId(roomId: string): Promise<UserRoom[]> {
        return this.userRoomRepository.find({
            where: { roomId, deletedAt: IsNull() },
            relations: ['user', 'room', 'room.department', 'room.roomGroup'],
            order: { createdAt: 'DESC' },
        });
    }

    async findByUserAndRoom(userId: string, roomId: string): Promise<UserRoom | null> {
        return this.userRoomRepository.findOne({
            where: { userId, roomId, deletedAt: IsNull() },
            relations: ['user', 'room', 'room.department', 'room.roomGroup'],
        });
    }

    async save(userRoom: UserRoom): Promise<UserRoom> {
        return this.userRoomRepository.save(userRoom);
    }

    async delete(id: string): Promise<void> {
        await this.userRoomRepository.softDelete(id);
    }

    async deleteByUserAndRoom(userId: string, roomId: string): Promise<void> {
        await this.userRoomRepository.softDelete({ userId, roomId });
    }

    async deleteByUserId(userId: string): Promise<void> {
        await this.userRoomRepository.softDelete({ userId });
    }

    async existsByUserAndRoom(userId: string, roomId: string): Promise<boolean> {
        const count = await this.userRoomRepository.count({
            where: { userId, roomId, deletedAt: IsNull() },
        });
        return count > 0;
    }

    async findActiveByUserId(userId: string): Promise<UserRoom[]> {
        return this.userRoomRepository.find({
            where: { userId, isActive: true, deletedAt: IsNull() },
            relations: ['user', 'room', 'room.department', 'room.roomGroup'],
            order: { createdAt: 'DESC' },
        });
    }

    async findWithRoomDetails(userId: string): Promise<UserRoom[]> {
        return this.userRoomRepository
            .createQueryBuilder('userRoom')
            .leftJoinAndSelect('userRoom.room', 'room')
            .leftJoinAndSelect('room.department', 'department')
            .leftJoinAndSelect('room.roomGroup', 'roomGroup')
            .leftJoinAndSelect('department.branch', 'branch')
            .where('userRoom.userId = :userId', { userId })
            .andWhere('userRoom.deletedAt IS NULL')
            .andWhere('userRoom.isActive = :isActive', { isActive: true })
            .orderBy('userRoom.createdAt', 'DESC')
            .getMany();
    }
}
