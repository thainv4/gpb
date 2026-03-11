import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserRoom } from './entities/user-room.entity';
import { IUserRoomRepository } from './interfaces/user-room.repository.interface';
import { AssignRoomsDto } from './dto/commands/assign-rooms.dto';
import { UpdateUserRoomDto } from './dto/commands/update-user-room.dto';
import { GetUserRoomsDto } from './dto/queries/get-user-rooms.dto';
import { UserRoomResponseDto } from './dto/responses/user-room-response.dto';
import { GetUserRoomsResult } from './dto/responses/user-rooms-list-response.dto';
import { MyRoomsResponseDto, UserRoomItemDto } from './dto/responses/my-rooms-response.dto';
import { DataLoaderService } from '../../shared/dataloaders/dataloader.service';
import { BaseService } from '../../common/services/base.service';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { CurrentUser } from '../../common/interfaces/current-user.interface';
import { IProfileRepository } from '../profile/interfaces/profile.repository.interface';

@Injectable()
export class UserRoomService extends BaseService {
    constructor(
        @Inject('IUserRoomRepository')
        private readonly userRoomRepository: IUserRoomRepository,
        @Inject('IProfileRepository')
        private readonly profileRepository: IProfileRepository,
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

            // Hard delete - xóa hoàn toàn bản ghi
            await manager.remove(UserRoom, userRoom);
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

        const resultFormType = userId ? await this.getResultFormTypeFromUserProfile(userId) : undefined;
        const userRoomDtos = userRooms.map(userRoom => this.mapUserRoomToResponseDto(userRoom, resultFormType));

        return {
            userRooms: userRoomDtos,
            total: userRooms.length,
            limit: query.limit || 10,
            offset: query.offset || 0
        };
    }

    async getUserRoomsByUserId(userId: string): Promise<UserRoomResponseDto[]> {
        const userRooms = await this.userRoomRepository.findWithRoomDetails(userId);
        const resultFormType = await this.getResultFormTypeFromUserProfile(userId);
        return userRooms.map(userRoom => this.mapUserRoomToResponseDto(userRoom, resultFormType));
    }

    /** Trả về my-rooms với resultFormType ở ngoài, mảng userRooms không chứa resultFormType. */
    async getMyRooms(userId: string): Promise<MyRoomsResponseDto> {
        const userRooms = await this.userRoomRepository.findWithRoomDetails(userId);
        const resultFormType = await this.getResultFormTypeFromUserProfile(userId);
        const fullDtos = userRooms.map(userRoom => this.mapUserRoomToResponseDto(userRoom, resultFormType));
        const userRoomsItems: UserRoomItemDto[] = fullDtos.map(({ resultFormType: _r, ...rest }) => rest as UserRoomItemDto);
        return { resultFormType: resultFormType ?? null, userRooms: userRoomsItems };
    }

    async canUserAccessRoom(userId: string, roomId: string): Promise<boolean> {
        return this.userRoomRepository.existsByUserAndRoom(userId, roomId);
    }

    async getUserRoomById(userRoomId: string): Promise<UserRoomResponseDto> {
        const userRoom = await this.userRoomRepository.findById(userRoomId);
        if (!userRoom) {
            throw new NotFoundException('Phân quyền phòng không tồn tại');
        }
        const resultFormType = await this.getResultFormTypeFromUserProfile(userRoom.userId);
        return this.mapUserRoomToResponseDto(userRoom, resultFormType);
    }

    // ========== PRIVATE METHODS ==========

    /** Lấy resultFormType từ Profile → Department của user (không qua Room). */
    private async getResultFormTypeFromUserProfile(userId: string): Promise<number | null | undefined> {
        const profile = await this.profileRepository.findWithRelations(userId);
        return profile?.department?.resultFormType ?? undefined;
    }

    private mapUserRoomToResponseDto(userRoom: UserRoom, resultFormTypeFromProfile?: number | null): UserRoomResponseDto {
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
            selectPrefix: userRoom.room?.selectPrefix,
            departmentId: userRoom.room?.department?.id || '',
            departmentName: userRoom.room?.department?.departmentName || '',
            departmentCode: userRoom.room?.department?.departmentCode || '',
            resultFormType: resultFormTypeFromProfile !== undefined ? resultFormTypeFromProfile : userRoom.room?.department?.resultFormType,
            branchId: userRoom.room?.department?.branch?.id || '',
            branchName: userRoom.room?.department?.branch?.branchName || '',
            isActive: userRoom.isActive,
            createdAt: userRoom.createdAt,
            updatedAt: userRoom.updatedAt,
        };
    }
}
