import { UserRoom } from '../entities/user-room.entity';

export interface IUserRoomRepository {
    findById(id: string): Promise<UserRoom | null>;
    findByUserId(userId: string): Promise<UserRoom[]>;
    findByRoomId(roomId: string): Promise<UserRoom[]>;
    findByUserAndRoom(userId: string, roomId: string): Promise<UserRoom | null>;
    save(userRoom: UserRoom): Promise<UserRoom>;
    delete(id: string): Promise<void>;
    deleteByUserAndRoom(userId: string, roomId: string): Promise<void>;
    deleteByUserId(userId: string): Promise<void>;
    existsByUserAndRoom(userId: string, roomId: string): Promise<boolean>;
    findActiveByUserId(userId: string): Promise<UserRoom[]>;
    findWithRoomDetails(userId: string): Promise<UserRoom[]>;
}
