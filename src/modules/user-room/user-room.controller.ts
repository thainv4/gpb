import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { UserRoomService } from './user-room.service';
import { AssignRoomsDto } from './dto/commands/assign-rooms.dto';
import { UpdateUserRoomDto } from './dto/commands/update-user-room.dto';
import { GetUserRoomsDto } from './dto/queries/get-user-rooms.dto';
import { UserRoomResponseDto } from './dto/responses/user-room-response.dto';
import { GetUserRoomsResult } from './dto/responses/user-rooms-list-response.dto';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';
import { BadRequestException } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser as ICurrentUser } from '../../common/interfaces/current-user.interface';

@ApiTags('User Rooms')
@Controller('user-rooms')
@UseGuards(DualAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UserRoomController {
    constructor(private readonly userRoomService: UserRoomService) { }

    // ========== COMMANDS (Write Operations) ==========

    @Post('users/:userId/rooms')
    @HttpCode(201)
    @ApiOperation({
        summary: 'Gán phòng cho user',
        description: 'Admin gán danh sách phòng cho user cụ thể. Sẽ xóa tất cả phân quyền cũ và tạo mới.'
    })
    @ApiResponse({ status: 201, description: 'Phòng đã được gán thành công' })
    @ApiParam({ name: 'userId', description: 'ID của user' })
    @ApiBody({ type: AssignRoomsDto })
    async assignRoomsToUser(
        @Param('userId') userId: string,
        @Body() assignRoomsDto: AssignRoomsDto,
        @CurrentUser() currentUser: ICurrentUser | null,
    ) {
        if (!currentUser) {
            throw new BadRequestException('JWT authentication required for assigning rooms. HIS token is not supported for write operations.');
        }
        await this.userRoomService.assignRoomsToUser(userId, assignRoomsDto, currentUser);
        return ResponseBuilder.success({ message: 'Phòng đã được gán thành công' }, 201);
    }

    @Delete('users/:userId/rooms/:roomId')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Gỡ phòng khỏi user',
        description: 'Admin gỡ một phòng cụ thể khỏi user'
    })
    @ApiResponse({ status: 200, description: 'Phòng đã được gỡ thành công' })
    @ApiParam({ name: 'userId', description: 'ID của user' })
    @ApiParam({ name: 'roomId', description: 'ID của phòng' })
    async removeRoomFromUser(
        @Param('userId') userId: string,
        @Param('roomId') roomId: string,
        @CurrentUser() currentUser: ICurrentUser | null,
    ) {
        if (!currentUser) {
            throw new BadRequestException('JWT authentication required for removing rooms. HIS token is not supported for write operations.');
        }
        await this.userRoomService.removeRoomFromUser(userId, roomId, currentUser);
        return ResponseBuilder.success({ message: 'Phòng đã được gỡ thành công' });
    }

    @Put(':userRoomId')
    @ApiOperation({
        summary: 'Cập nhật phân quyền phòng',
        description: 'Cập nhật trạng thái hoạt động của phân quyền phòng'
    })
    @ApiResponse({ status: 200, description: 'Phân quyền phòng đã được cập nhật thành công', type: UserRoomResponseDto })
    @ApiParam({ name: 'userRoomId', description: 'ID của phân quyền phòng' })
    @ApiBody({ type: UpdateUserRoomDto })
    async updateUserRoom(
        @Param('userRoomId') userRoomId: string,
        @Body() updateDto: UpdateUserRoomDto,
        @CurrentUser() currentUser: ICurrentUser | null,
    ) {
        if (!currentUser) {
            throw new BadRequestException('JWT authentication required for updating user rooms. HIS token is not supported for write operations.');
        }
        await this.userRoomService.updateUserRoom(userRoomId, updateDto, currentUser);
        return ResponseBuilder.success({ message: 'Phân quyền phòng đã được cập nhật thành công' });
    }

    // ========== QUERIES (Read Operations) ==========

    @Get()
    @ApiOperation({
        summary: 'Lấy danh sách phân quyền phòng',
        description: 'Lấy danh sách phân quyền phòng với các bộ lọc'
    })
    @ApiResponse({ status: 200, description: 'Danh sách phân quyền phòng' })
    @ApiQuery({ name: 'userId', required: false, type: String, description: 'ID của user' })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Lọc theo trạng thái hoạt động' })
    async getUserRooms(@Query() query: GetUserRoomsDto) {
        const result = await this.userRoomService.getUserRooms(query);
        return ResponseBuilder.success(result);
    }

    @Get('users/:userId')
    @ApiOperation({
        summary: 'Lấy danh sách phòng của user',
        description: 'Lấy danh sách phòng được phân quyền cho user cụ thể'
    })
    @ApiResponse({ status: 200, description: 'Danh sách phòng của user', type: [UserRoomResponseDto] })
    @ApiParam({ name: 'userId', description: 'ID của user' })
    async getUserRoomsByUserId(@Param('userId') userId: string) {
        const userRooms = await this.userRoomService.getUserRoomsByUserId(userId);
        return ResponseBuilder.success(userRooms);
    }

    @Get('my-rooms')
    @ApiOperation({
        summary: 'Lấy danh sách phòng của user hiện tại',
        description: 'User lấy danh sách phòng được phân quyền cho mình'
    })
    @ApiResponse({ status: 200, description: 'Danh sách phòng của user hiện tại', type: [UserRoomResponseDto] })
    async getMyRooms(@CurrentUser() currentUser: ICurrentUser) {
        const userRooms = await this.userRoomService.getUserRoomsByUserId(currentUser.id);
        return ResponseBuilder.success(userRooms);
    }

    @Get(':userRoomId')
    @ApiOperation({
        summary: 'Lấy thông tin phân quyền phòng',
        description: 'Lấy thông tin chi tiết của một phân quyền phòng cụ thể'
    })
    @ApiResponse({ status: 200, description: 'Thông tin phân quyền phòng', type: UserRoomResponseDto })
    @ApiParam({ name: 'userRoomId', description: 'ID của phân quyền phòng' })
    async getUserRoomById(@Param('userRoomId') userRoomId: string) {
        const userRoom = await this.userRoomService.getUserRoomById(userRoomId);
        return ResponseBuilder.success(userRoom);
    }

    @Get('check/:userId/:roomId')
    @ApiOperation({
        summary: 'Kiểm tra quyền truy cập phòng',
        description: 'Kiểm tra user có quyền truy cập phòng cụ thể không'
    })
    @ApiResponse({ status: 200, description: 'Kết quả kiểm tra quyền truy cập' })
    @ApiParam({ name: 'userId', description: 'ID của user' })
    @ApiParam({ name: 'roomId', description: 'ID của phòng' })
    async checkUserRoomAccess(
        @Param('userId') userId: string,
        @Param('roomId') roomId: string,
    ) {
        const hasAccess = await this.userRoomService.canUserAccessRoom(userId, roomId);
        return ResponseBuilder.success({
            userId,
            roomId,
            hasAccess,
            message: hasAccess ? 'User có quyền truy cập phòng' : 'User không có quyền truy cập phòng'
        });
    }
}
