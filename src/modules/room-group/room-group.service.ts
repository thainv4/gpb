import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IRoomGroupRepository } from './interfaces/room-group.repository.interface';
import { CreateRoomGroupDto } from './dto/commands/create-room-group.dto';
import { UpdateRoomGroupDto } from './dto/commands/update-room-group.dto';
import { RoomGroup } from './entities/room-group.entity';
import { AppError } from '../../common/errors/app.error';
import { GetRoomGroupsDto, GetRoomGroupsResult } from './dto/queries/get-room-groups.dto';
import { RoomGroupResponseDto } from './dto/responses/room-group-response.dto';
import { SearchRoomGroupsDto } from './dto/queries/search-room-groups.dto';
import { CurrentUser } from '../../common/interfaces/current-user.interface';
import { DataLoaderService } from '../../shared/dataloaders/dataloader.service';
import { BaseService } from '../../common/services/base.service';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';

@Injectable()
export class RoomGroupService extends BaseService {
    constructor(
        @Inject('IRoomGroupRepository')
        private readonly roomGroupRepository: IRoomGroupRepository,
        @Inject(DataSource)
        protected readonly dataSource: DataSource,
        private readonly dataLoaderService: DataLoaderService,
        @Inject(CurrentUserContextService)
        protected readonly currentUserContext: CurrentUserContextService,
    ) {
        super(dataSource, currentUserContext);
    }

    // ========== COMMANDS (Write Operations) ==========

    async createRoomGroup(
        createDto: CreateRoomGroupDto,
        currentUser: CurrentUser
    ): Promise<string> {
        // Set current user context for automatic audit
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            // Check if room group code already exists
            const existingByCode = await this.roomGroupRepository.existsByCode(createDto.roomGroupCode);
            if (existingByCode) {
                throw AppError.conflict('Room group with this code already exists');
            }

            // Check if room group name already exists
            const existingByName = await this.roomGroupRepository.existsByName(createDto.roomGroupName);
            if (existingByName) {
                throw AppError.conflict('Room group with this name already exists');
            }

            const roomGroup = new RoomGroup();
            roomGroup.roomGroupCode = createDto.roomGroupCode;
            roomGroup.roomGroupName = createDto.roomGroupName;
            roomGroup.sortOrder = createDto.sortOrder ?? await this.roomGroupRepository.getNextSortOrder();

            // ✅ Automatic audit fields - no manual assignment needed!
            this.setAuditFields(roomGroup, false); // false = create operation

            const savedRoomGroup = await manager.save(RoomGroup, roomGroup);
            return savedRoomGroup.id;
        });
    }

    async updateRoomGroup(
        id: string,
        updateDto: UpdateRoomGroupDto,
        currentUser: CurrentUser
    ): Promise<void> {
        // Set current user context for automatic audit
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            const roomGroup = await this.roomGroupRepository.findById(id);
            if (!roomGroup) {
                throw AppError.notFound('Room group not found');
            }

            // Check if room group code already exists (if changed)
            if (updateDto.roomGroupCode && updateDto.roomGroupCode !== roomGroup.roomGroupCode) {
                const exists = await this.roomGroupRepository.existsByCode(updateDto.roomGroupCode, id);
                if (exists) {
                    throw AppError.conflict('Room group with this code already exists');
                }
            }

            // Check if room group name already exists (if changed)
            if (updateDto.roomGroupName && updateDto.roomGroupName !== roomGroup.roomGroupName) {
                const exists = await this.roomGroupRepository.existsByName(updateDto.roomGroupName, id);
                if (exists) {
                    throw AppError.conflict('Room group with this name already exists');
                }
            }

            Object.assign(roomGroup, updateDto);

            // ✅ Automatic audit fields - no manual assignment needed!
            this.setAuditFields(roomGroup, true); // true = update operation

            await manager.save(RoomGroup, roomGroup);
        });
    }

    async deleteRoomGroup(id: string, hardDelete: boolean = false): Promise<void> {
        const roomGroup = await this.roomGroupRepository.findById(id);
        if (!roomGroup) {
            throw AppError.notFound('Room group not found');
        }

        if (hardDelete) {
            await this.roomGroupRepository.delete(id);
        } else {
            await this.roomGroupRepository.softDelete(id);
        }
    }

    // ========== QUERIES (Read Operations) ==========

    async getRoomGroupById(id: string): Promise<RoomGroupResponseDto> {
        const roomGroup = await this.roomGroupRepository.findById(id);
        if (!roomGroup) {
            throw AppError.notFound('Room group not found');
        }
        return this.mapToResponseDto(roomGroup);
    }

    async getRoomGroups(query: GetRoomGroupsDto): Promise<GetRoomGroupsResult> {
        const { limit = 10, offset = 0, search, isActive, sortBy = 'sortOrder', sortOrder = 'ASC' } = query;

        const [roomGroups, total] = await this.roomGroupRepository.findWithPagination(
            limit,
            offset,
            sortBy,
            sortOrder,
            { isActive, search }
        );

        return {
            roomGroups: roomGroups.map(rg => this.mapToResponseDto(rg)),
            total,
            limit,
            offset,
        };
    }

    async searchRoomGroups(query: SearchRoomGroupsDto): Promise<GetRoomGroupsResult> {
        const { keyword, limit = 10, offset = 0, isActive, sortBy = 'sortOrder', sortOrder = 'ASC' } = query;

        const [roomGroups, total] = await this.roomGroupRepository.findWithPagination(
            limit,
            offset,
            sortBy,
            sortOrder,
            { isActive, search: keyword }
        );

        return {
            roomGroups: roomGroups.map(rg => this.mapToResponseDto(rg)),
            total,
            limit,
            offset,
        };
    }

    // ========== DATALOADER INTEGRATION ==========

    async getRoomGroupsWithStats(query: GetRoomGroupsDto): Promise<GetRoomGroupsResult> {
        const { limit = 10, offset = 0 } = query;

        const [roomGroups, total] = await this.roomGroupRepository.findWithPagination(
            limit,
            offset,
            'sortOrder',
            'ASC',
            { isActive: true }
        );

        const loaders = this.dataLoaderService.createLoaders();

        const roomGroupsWithStats = await Promise.all(
            roomGroups.map(async (roomGroup) => {
                // Example: Load related data using DataLoader (if needed)
                // const relatedData = await loaders.someRelatedDataLoader.load(roomGroup.id);

                return {
                    ...this.mapToResponseDto(roomGroup),
                    // Add related data here
                };
            })
        );

        return {
            roomGroups: roomGroupsWithStats,
            total,
            limit,
            offset,
        };
    }

    // ========== STATISTICS ==========

    async getStatsOverview(): Promise<any> {
        const total = await this.roomGroupRepository.countTotal();
        const active = await this.roomGroupRepository.countActive();

        return {
            total,
            active,
            inactive: total - active,
        };
    }

    // ========== UTILITY METHODS ==========

    async reorderRoomGroups(roomGroupIds: string[]): Promise<void> {
        // TODO: Implement reorder logic
        console.log('Reordering room groups:', roomGroupIds);
    }

    private mapToResponseDto(roomGroup: RoomGroup): RoomGroupResponseDto {
        return {
            id: roomGroup.id,
            roomGroupCode: roomGroup.roomGroupCode,
            roomGroupName: roomGroup.roomGroupName,
            displayName: roomGroup.getDisplayName(),
            sortOrder: roomGroup.sortOrder,
            isActive: roomGroup.isActive,
            version: roomGroup.version,
            createdAt: roomGroup.createdAt,
            updatedAt: roomGroup.updatedAt,
        };
    }
}
