import { Injectable, Inject, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Room } from './entities/room.entity';
import { IRoomRepository } from './interfaces/room.repository.interface';
import { CreateRoomDto } from './dto/commands/create-room.dto';
import { UpdateRoomDto } from './dto/commands/update-room.dto';
import { GetRoomsDto } from './dto/queries/get-rooms.dto';
import { SearchRoomsDto } from './dto/queries/search-rooms.dto';
import { GetRoomsByDepartmentDto } from './dto/queries/get-rooms-by-department.dto';
import { GetRoomsByGroupDto } from './dto/queries/get-rooms-by-group.dto';
import { RoomResponseDto } from './dto/responses/room-response.dto';
import { RoomsListResponseDto, RoomPaginationDto } from './dto/responses/rooms-list-response.dto';
import { BaseService } from '../../common/services/base.service';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { DataLoaderService } from '../../shared/dataloaders/dataloader.service';
import { AppError } from '../../common/errors/app.error';

export interface CurrentUser {
    id: string;
    username: string;
    email: string;
}

export interface GetRoomsResult {
    rooms: RoomResponseDto[];
    total: number;
    limit: number;
    offset: number;
}

@Injectable()
export class RoomService extends BaseService {
    constructor(
        @Inject('IRoomRepository')
        private readonly roomRepository: IRoomRepository,
        @Inject(DataSource)
        protected readonly dataSource: DataSource,
        @Inject(CurrentUserContextService)
        protected readonly currentUserContext: CurrentUserContextService,
        private readonly dataLoaderService: DataLoaderService,
    ) {
        super(dataSource, currentUserContext);
    }

    // ========== COMMANDS (Write Operations) ==========

    async createRoom(createRoomDto: CreateRoomDto, currentUser: CurrentUser): Promise<string> {
        // Set current user context for automatic audit
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            // Check if room code already exists
            const existingByCode = await this.roomRepository.existsByCode(createRoomDto.roomCode);
            if (existingByCode) {
                throw new ConflictException('Room with this code already exists');
            }

            // Check if room name already exists in department
            const existingByNameInDepartment = await this.roomRepository.existsByNameInDepartment(
                createRoomDto.roomName,
                createRoomDto.departmentId
            );
            if (existingByNameInDepartment) {
                throw new ConflictException('Room with this name already exists in department');
            }

            // Create room
            const room = new Room();
            room.roomCode = createRoomDto.roomCode;
            room.roomName = createRoomDto.roomName;
            room.roomAddress = createRoomDto.roomAddress;
            room.departmentId = createRoomDto.departmentId;
            room.roomGroupId = createRoomDto.roomGroupId;
            room.description = createRoomDto.description;
            room.isActive = createRoomDto.isActive ?? true;
            room.sortOrder = createRoomDto.sortOrder ?? 0;

            // ✅ Automatic audit fields - no manual assignment needed!
            this.setAuditFields(room, false); // false = create operation

            const savedRoom = await manager.save(Room, room);
            return savedRoom.id;
        });
    }

    async updateRoom(id: string, updateRoomDto: UpdateRoomDto, currentUser: CurrentUser): Promise<void> {
        // Set current user context for automatic audit
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            const room = await this.roomRepository.findById(id);
            if (!room) {
                throw new NotFoundException('Room not found');
            }

            // Check if room name already exists in department (if changed)
            if (updateRoomDto.roomName && updateRoomDto.roomName !== room.roomName) {
                const targetDepartmentId = updateRoomDto.departmentId || room.departmentId;
                const existingByNameInDepartment = await this.roomRepository.existsByNameInDepartment(
                    updateRoomDto.roomName,
                    targetDepartmentId,
                    id
                );
                if (existingByNameInDepartment) {
                    throw new ConflictException('Room with this name already exists in department');
                }
            }

            // Update room fields
            Object.assign(room, updateRoomDto);

            // ✅ Automatic audit fields - no manual assignment needed!
            this.setAuditFields(room, true); // true = update operation

            await manager.save(Room, room);
        });
    }

    async deleteRoom(id: string, currentUser: CurrentUser): Promise<void> {
        // Set current user context for automatic audit
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            const room = await this.roomRepository.findById(id);
            if (!room) {
                throw new NotFoundException('Room not found');
            }

            await this.roomRepository.delete(id);
        });
    }

    // ========== QUERIES (Read Operations) ==========

    async getRoomById(id: string): Promise<RoomResponseDto> {
        const room = await this.roomRepository.findById(id);
        if (!room) {
            throw new NotFoundException('Room not found');
        }

        return this.mapRoomToResponseDto(room);
    }

    async getRooms(query: GetRoomsDto): Promise<GetRoomsResult> {
        const { limit = 10, offset = 0, isActive, departmentId, roomGroupId } = query;

        let rooms: Room[];
        let total: number;

        if (departmentId) {
            [rooms, total] = await this.roomRepository.findByDepartmentId(departmentId, limit, offset);
        } else if (roomGroupId) {
            [rooms, total] = await this.roomRepository.findByRoomGroupId(roomGroupId, limit, offset);
        } else if (isActive !== undefined) {
            if (isActive) {
                [rooms, total] = await this.roomRepository.findActive(limit, offset);
            } else {
                [rooms, total] = await this.roomRepository.findAll(limit, offset);
            }
        } else {
            [rooms, total] = await this.roomRepository.findAll(limit, offset);
        }

        return {
            rooms: rooms.map(room => this.mapRoomToResponseDto(room)),
            total,
            limit,
            offset,
        };
    }

    async searchRooms(searchDto: SearchRoomsDto): Promise<GetRoomsResult> {
        const { searchTerm, limit = 10, offset = 0, isActive, departmentId, roomGroupId } = searchDto;

        // Search in different fields
        const [byCode, byName, byAddress, byDescription] = await Promise.all([
            this.roomRepository.searchByCode(searchTerm),
            this.roomRepository.searchByName(searchTerm),
            this.roomRepository.searchByAddress(searchTerm),
            this.roomRepository.searchByDescription(searchTerm),
        ]);

        // Combine and deduplicate results
        const allRooms = [...byCode, ...byName, ...byAddress, ...byDescription];
        const uniqueRooms = allRooms.filter((room, index, self) =>
            index === self.findIndex(r => r.id === room.id)
        );

        // Apply additional filters
        let filteredRooms = uniqueRooms;

        if (isActive !== undefined) {
            filteredRooms = filteredRooms.filter(room => room.isActive === isActive);
        }

        if (departmentId) {
            filteredRooms = filteredRooms.filter(room => room.departmentId === departmentId);
        }

        if (roomGroupId) {
            filteredRooms = filteredRooms.filter(room => room.roomGroupId === roomGroupId);
        }

        // Apply pagination
        const total = filteredRooms.length;
        const paginatedRooms = filteredRooms.slice(offset, offset + limit);

        return {
            rooms: paginatedRooms.map(room => this.mapRoomToResponseDto(room)),
            total,
            limit,
            offset,
        };
    }

    async getRoomsByDepartment(query: GetRoomsByDepartmentDto): Promise<GetRoomsResult> {
        const { departmentId, limit = 10, offset = 0, isActive } = query;

        let [rooms, total] = await this.roomRepository.findByDepartmentId(departmentId, limit, offset);

        if (isActive !== undefined) {
            rooms = rooms.filter(room => room.isActive === isActive);
            total = rooms.length;
        }

        return {
            rooms: rooms.map(room => this.mapRoomToResponseDto(room)),
            total,
            limit,
            offset,
        };
    }

    async getRoomsByGroup(query: GetRoomsByGroupDto): Promise<GetRoomsResult> {
        const { roomGroupId, limit = 10, offset = 0, isActive } = query;

        let [rooms, total] = await this.roomRepository.findByRoomGroupId(roomGroupId, limit, offset);

        if (isActive !== undefined) {
            rooms = rooms.filter(room => room.isActive === isActive);
            total = rooms.length;
        }

        return {
            rooms: rooms.map(room => this.mapRoomToResponseDto(room)),
            total,
            limit,
            offset,
        };
    }

    // ========== STATISTICS ==========

    async getRoomStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
        byDepartment: { [key: string]: number };
        byRoomGroup: { [key: string]: number };
    }> {
        const [total, active, byDepartment, byRoomGroup] = await Promise.all([
            this.roomRepository.countTotal(),
            this.roomRepository.countActive(),
            this.getRoomStatsByDepartment(),
            this.getRoomStatsByRoomGroup(),
        ]);

        return {
            total,
            active,
            inactive: total - active,
            byDepartment,
            byRoomGroup,
        };
    }

    private async getRoomStatsByDepartment(): Promise<{ [key: string]: number }> {
        // This would need to be implemented in repository
        // For now, return empty object
        return {};
    }

    private async getRoomStatsByRoomGroup(): Promise<{ [key: string]: number }> {
        // This would need to be implemented in repository
        // For now, return empty object
        return {};
    }

    // ========== PRIVATE METHODS ==========

    private mapRoomToResponseDto(room: Room): RoomResponseDto {
        return {
            id: room.id,
            roomCode: room.roomCode,
            roomName: room.roomName,
            roomAddress: room.roomAddress,
            departmentId: room.departmentId,
            roomGroupId: room.roomGroupId,
            description: room.description,
            isActive: room.isActive,
            sortOrder: room.sortOrder,
            createdAt: room.createdAt,
            updatedAt: room.updatedAt,
            department: room.department ? {
                id: room.department.id,
                departmentCode: room.department.departmentCode,
                departmentName: room.department.departmentName,
            } : undefined,
            roomGroup: room.roomGroup ? {
                id: room.roomGroup.id,
                roomGroupCode: room.roomGroup.roomGroupCode,
                roomGroupName: room.roomGroup.roomGroupName,
            } : undefined,
        };
    }
}
