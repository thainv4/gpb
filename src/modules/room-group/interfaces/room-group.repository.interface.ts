import { RoomGroup } from '../entities/room-group.entity';

export interface IRoomGroupRepository {
    // Basic CRUD operations
    findById(id: string): Promise<RoomGroup | null>;
    findByCode(roomGroupCode: string): Promise<RoomGroup | null>;
    save(roomGroup: RoomGroup): Promise<RoomGroup>;
    delete(id: string): Promise<void>;
    softDelete(id: string): Promise<void>;

    // Query operations
    findAll(): Promise<RoomGroup[]>;
    findActive(): Promise<RoomGroup[]>;
    findInactive(): Promise<RoomGroup[]>;
    findByIds(ids: string[]): Promise<RoomGroup[]>;

    // Search operations
    searchByKeyword(keyword: string): Promise<RoomGroup[]>;

    // Pagination and filtering
    findWithPagination(
        limit: number,
        offset: number,
        sortBy?: string,
        sortOrder?: 'ASC' | 'DESC',
        filters?: {
            isActive?: boolean;
            search?: string;
        }
    ): Promise<[RoomGroup[], number]>;

    // Statistics
    countTotal(): Promise<number>;
    countActive(): Promise<number>;
    countInactive(): Promise<number>;
    countByStatus(isActive: boolean): Promise<number>;

    // Utility methods
    getNextSortOrder(): Promise<number>;
    existsByCode(roomGroupCode: string, excludeId?: string): Promise<boolean>;
    existsByName(roomGroupName: string, excludeId?: string): Promise<boolean>;
}
