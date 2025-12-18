import { Room } from '../entities/room.entity';

export interface IRoomRepository {
    // ========== BASIC CRUD OPERATIONS ==========
    findById(id: string): Promise<Room | null>;
    save(room: Room): Promise<Room>;
    delete(id: string): Promise<void>;

    // ========== QUERY OPERATIONS ==========
    findAll(limit?: number, offset?: number): Promise<[Room[], number]>;
    findByDepartmentId(departmentId: string, limit?: number, offset?: number): Promise<[Room[], number]>;
    findByRoomGroupId(roomGroupId: string, limit?: number, offset?: number): Promise<[Room[], number]>;
    findActive(limit?: number, offset?: number): Promise<[Room[], number]>;

    // ========== SEARCH OPERATIONS ==========
    searchByCode(roomCode: string): Promise<Room[]>;
    searchByName(roomName: string): Promise<Room[]>;
    searchByAddress(address: string): Promise<Room[]>;
    searchByDescription(description: string): Promise<Room[]>;

    // ========== VALIDATION OPERATIONS ==========
    existsByCode(roomCode: string, excludeId?: string): Promise<boolean>;
    existsByName(roomName: string, excludeId?: string): Promise<boolean>;
    existsByNameInDepartment(roomName: string, departmentId: string, excludeId?: string): Promise<boolean>;

    // ========== STATISTICS OPERATIONS ==========
    countByDepartment(departmentId: string): Promise<number>;
    countByRoomGroup(roomGroupId: string): Promise<number>;
    countActive(): Promise<number>;
    countTotal(): Promise<number>;

    // ========== BATCH OPERATIONS ==========
    findByIds(ids: string[]): Promise<Room[]>;
    findByDepartmentIds(departmentIds: string[]): Promise<Room[]>;
    findByRoomGroupIds(roomGroupIds: string[]): Promise<Room[]>;
}
