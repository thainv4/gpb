import { Injectable, Inject, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserRoom } from './entities/user-room.entity';
import { IUserRoomRepository } from './interfaces/user-room.repository.interface';
import { AssignRoomsDto } from './dto/commands/assign-rooms.dto';
import { UpdateUserRoomDto } from './dto/commands/update-user-room.dto';
import { GetUserRoomsDto } from './dto/queries/get-user-rooms.dto';
import { UserRoomResponseDto } from './dto/responses/user-room-response.dto';
import { GetUserRoomsResult } from './dto/responses/user-rooms-list-response.dto';
import { DataLoaderService } from '../../shared/dataloaders/dataloader.service';
import { AppError } from '../../common/errors/app.error';
import { BaseService } from '../../common/services/base.service';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { CurrentUser } from '../../common/interfaces/current-user.interface';

@Injectable()
export class UserRoomService extends BaseService {
    constructor(
        @Inject('IUserRoomRepository')
        private readonly userRoomRepository: IUserRoomRepository,
        @Inject(DataSource)
        protected readonly dataSource: DataSource,
        private readonly dataLoaderService: DataLoaderService,
        protected readonly currentUserContext: CurrentUserContextService,
    ) {
        super(dataSource, currentUserContext);
    }

    // ========== COMMANDS (Write Operations) ==========

    async assignRoomsToUser(userId: string, assignRoomsDto: AssignRoomsDto, currentUser: CurrentUser): Promise<void> {
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            // Logic mới: Chỉ thêm các phòng chưa có, không xóa phòng cũ
            for (const roomId of assignRoomsDto.roomIds) {
                // Kiểm tra xem user đã có phòng này chưa
                const existingUserRoom = await this.userRoomRepository.findByUserAndRoom(userId, roomId);

                if (existingUserRoom) {
                    // Phòng đã tồn tại:
                    // - Nếu đang inactive, activate lại
                    // - Nếu đã active, skip (không làm gì)
                    if (!existingUserRoom.isActive) {
                        existingUserRoom.isActive = true;
                        this.setAuditFields(existingUserRoom, true); // true = update operation
                        await manager.save(UserRoom, existingUserRoom);
                    }
                    // Nếu đã active thì skip, không cần làm gì
                } else {
                    // Phòng chưa có: Tạo mới
                    const userRoom = new UserRoom();
                    userRoom.userId = userId;
                    userRoom.roomId = roomId;
                    userRoom.isActive = true;

                    this.setAuditFields(userRoom, false); // false = create operation

                    await manager.save(UserRoom, userRoom);
                }
            }
        });
    }


    async removeRoomFromUser(userId: string, roomId: string, currentUser: CurrentUser): Promise<void> {
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            const userRoom = await this.userRoomRepository.findByUserAndRoom(userId, roomId);
            if (!userRoom) {
                throw new NotFoundException('Phân quyền phòng không tồn tại');
            }

            await this.userRoomRepository.delete(userRoom.id);
        });
    }

    async updateUserRoom(userRoomId: string, updateDto: UpdateUserRoomDto, currentUser: CurrentUser): Promise<void> {
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            const userRoom = await this.userRoomRepository.findById(userRoomId);
            if (!userRoom) {
                throw new NotFoundException('Phân quyền phòng không tồn tại');
            }

            if (updateDto.isActive !== undefined) {
                userRoom.isActive = updateDto.isActive;
            }

            this.setAuditFields(userRoom, true); // true = update operation

            await manager.save(UserRoom, userRoom);
        });
    }

    // ========== QUERIES (Read Operations) ==========

    async getUserRooms(query: GetUserRoomsDto): Promise<GetUserRoomsResult> {
        const { userId, isActive } = query;

        let userRooms: UserRoom[];

        if (userId) {
            if (isActive !== undefined) {
                userRooms = isActive
                    ? await this.userRoomRepository.findActiveByUserId(userId)
                    : await this.userRoomRepository.findByUserId(userId);
            } else {
                userRooms = await this.userRoomRepository.findWithRoomDetails(userId);
            }
        } else {
            // Nếu không có userId, lấy tất cả user rooms (không có pagination trong interface hiện tại)
            userRooms = await this.userRoomRepository.findByUserId(''); // Tạm thời để trống
        }

        const userRoomDtos = userRooms.map(userRoom => this.mapUserRoomToResponseDto(userRoom));

        return {
            userRooms: userRoomDtos,
            total: userRooms.length,
            limit: query.limit || 10,
            offset: query.offset || 0
        };
    }

    async getUserRoomsByUserId(userId: string): Promise<UserRoomResponseDto[]> {
        const userRooms = await this.userRoomRepository.findWithRoomDetails(userId);
        return userRooms.map(userRoom => this.mapUserRoomToResponseDto(userRoom));
    }

    async canUserAccessRoom(userId: string, roomId: string): Promise<boolean> {
        return this.userRoomRepository.existsByUserAndRoom(userId, roomId);
    }

    async getUserRoomById(userRoomId: string): Promise<UserRoomResponseDto> {
        const userRoom = await this.userRoomRepository.findById(userRoomId);
        if (!userRoom) {
            throw new NotFoundException('Phân quyền phòng không tồn tại');
        }

        return this.mapUserRoomToResponseDto(userRoom);
    }

    // ========== PRIVATE METHODS ==========

    private mapUserRoomToResponseDto(userRoom: UserRoom): UserRoomResponseDto {
        return {
            id: userRoom.id,
            userId: userRoom.userId,
            username: userRoom.user?.username || '',
            userFullName: userRoom.user?.fullName || '',
            roomId: userRoom.roomId,
            roomCode: userRoom.room?.roomCode || '',
            roomName: userRoom.room?.roomName || '',
            roomAddress: userRoom.room?.roomAddress || '',
            roomDescription: userRoom.room?.description || '',
            departmentId: userRoom.room?.department?.id || '',
            departmentName: userRoom.room?.department?.departmentName || '',
            departmentCode: userRoom.room?.department?.departmentCode || '',
            branchId: userRoom.room?.department?.branch?.id || '',
            branchName: userRoom.room?.department?.branch?.branchName || '',
            isActive: userRoom.isActive,
            createdAt: userRoom.createdAt,
            updatedAt: userRoom.updatedAt,
        };
    }
}
