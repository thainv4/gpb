import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/commands/create-room.dto';
import { UpdateRoomDto } from './dto/commands/update-room.dto';
import { GetRoomsDto } from './dto/queries/get-rooms.dto';
import { SearchRoomsDto } from './dto/queries/search-rooms.dto';
import { GetRoomsByDepartmentDto } from './dto/queries/get-rooms-by-department.dto';
import { GetRoomsByGroupDto } from './dto/queries/get-rooms-by-group.dto';
import { RoomResponseDto } from './dto/responses/room-response.dto';
import { RoomsListResponseDto } from './dto/responses/rooms-list-response.dto';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser as CurrentUserInterface } from '../../common/interfaces/current-user.interface';

@ApiTags('Rooms')
@Controller('rooms')
@UseGuards(DualAuthGuard)
@ApiBearerAuth('JWT-auth')
export class RoomController {
    constructor(private readonly roomService: RoomService) { }

    // ========== COMMANDS (Write Operations) ==========

    @Post()
    @ApiOperation({
        summary: 'Tạo phòng mới',
        description: 'Tạo một phòng mới với mã, tên và các thông tin khác.'
    })
    @ApiBody({ type: CreateRoomDto })
    @ApiResponse({
        status: 201,
        description: 'Phòng được tạo thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 201 },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'room-001' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    @ApiResponse({ status: 409, description: 'Mã phòng hoặc tên phòng đã tồn tại' })
    async createRoom(
        @Body() createRoomDto: CreateRoomDto,
        @CurrentUser() currentUser: CurrentUserInterface
    ) {
        const roomId = await this.roomService.createRoom(createRoomDto, currentUser);
        return ResponseBuilder.success({ id: roomId }, HttpStatus.CREATED);
    }

    @Put(':id')
    @ApiOperation({
        summary: 'Cập nhật phòng',
        description: 'Cập nhật thông tin của một phòng hiện có.'
    })
    @ApiParam({ name: 'id', description: 'ID của phòng cần cập nhật' })
    @ApiBody({ type: UpdateRoomDto })
    @ApiResponse({
        status: 200,
        description: 'Phòng được cập nhật thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 200 },
                data: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Room updated successfully' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy phòng' })
    @ApiResponse({ status: 409, description: 'Tên phòng đã tồn tại trong khoa' })
    async updateRoom(
        @Param('id') id: string,
        @Body() updateRoomDto: UpdateRoomDto,
        @CurrentUser() currentUser: CurrentUserInterface
    ) {
        await this.roomService.updateRoom(id, updateRoomDto, currentUser);
        return ResponseBuilder.success({ message: 'Room updated successfully' });
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Xóa phòng',
        description: 'Xóa mềm một phòng khỏi hệ thống.'
    })
    @ApiParam({ name: 'id', description: 'ID của phòng cần xóa' })
    @ApiResponse({ status: 204, description: 'Phòng được xóa thành công' })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy phòng' })
    async deleteRoom(
        @Param('id') id: string,
        @CurrentUser() currentUser: CurrentUserInterface
    ) {
        await this.roomService.deleteRoom(id, currentUser);
        return ResponseBuilder.success(null, HttpStatus.NO_CONTENT);
    }

    // ========== QUERIES (Read Operations) ==========

    @Get()
    @ApiOperation({
        summary: 'Lấy danh sách phòng',
        description: 'Lấy danh sách phòng với phân trang và bộ lọc.'
    })
    @ApiQuery({ name: 'limit', required: false, description: 'Số lượng bản ghi trả về', example: 10 })
    @ApiQuery({ name: 'offset', required: false, description: 'Vị trí bắt đầu', example: 0 })
    @ApiQuery({ name: 'isActive', required: false, description: 'Lọc theo trạng thái hoạt động', example: true })
    @ApiQuery({ name: 'departmentId', required: false, description: 'Lọc theo khoa', example: 'dept-001' })
    @ApiQuery({ name: 'roomGroupId', required: false, description: 'Lọc theo nhóm phòng', example: 'group-001' })
    @ApiResponse({
        status: 200,
        description: 'Danh sách phòng',
        type: RoomsListResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async getRooms(@Query() query: GetRoomsDto) {
        const result = await this.roomService.getRooms(query);
        return ResponseBuilder.success(result);
    }

    @Get('search')
    @ApiOperation({
        summary: 'Tìm kiếm phòng',
        description: 'Tìm kiếm phòng theo từ khóa.'
    })
    @ApiQuery({ name: 'searchTerm', required: true, description: 'Từ khóa tìm kiếm', example: 'phòng 101' })
    @ApiQuery({ name: 'limit', required: false, description: 'Số lượng bản ghi trả về', example: 10 })
    @ApiQuery({ name: 'offset', required: false, description: 'Vị trí bắt đầu', example: 0 })
    @ApiQuery({ name: 'isActive', required: false, description: 'Lọc theo trạng thái hoạt động', example: true })
    @ApiQuery({ name: 'departmentId', required: false, description: 'Lọc theo khoa', example: 'dept-001' })
    @ApiQuery({ name: 'roomGroupId', required: false, description: 'Lọc theo nhóm phòng', example: 'group-001' })
    @ApiResponse({
        status: 200,
        description: 'Kết quả tìm kiếm phòng',
        type: RoomsListResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async searchRooms(@Query() searchDto: SearchRoomsDto) {
        const result = await this.roomService.searchRooms(searchDto);
        return ResponseBuilder.success(result);
    }

    @Get('by-department/:departmentId')
    @ApiOperation({
        summary: 'Lấy phòng theo khoa',
        description: 'Lấy danh sách phòng thuộc một khoa cụ thể.'
    })
    @ApiParam({ name: 'departmentId', description: 'ID khoa' })
    @ApiQuery({ name: 'limit', required: false, description: 'Số lượng bản ghi trả về', example: 10 })
    @ApiQuery({ name: 'offset', required: false, description: 'Vị trí bắt đầu', example: 0 })
    @ApiQuery({ name: 'isActive', required: false, description: 'Lọc theo trạng thái hoạt động', example: true })
    @ApiResponse({
        status: 200,
        description: 'Danh sách phòng theo khoa',
        type: RoomsListResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async getRoomsByDepartment(
        @Param('departmentId') departmentId: string,
        @Query() query: Omit<GetRoomsByDepartmentDto, 'departmentId'>
    ) {
        const result = await this.roomService.getRoomsByDepartment({ departmentId, ...query });
        return ResponseBuilder.success(result);
    }

    @Get('by-group/:roomGroupId')
    @ApiOperation({
        summary: 'Lấy phòng theo nhóm phòng',
        description: 'Lấy danh sách phòng thuộc một nhóm phòng cụ thể.'
    })
    @ApiParam({ name: 'roomGroupId', description: 'ID nhóm phòng' })
    @ApiQuery({ name: 'limit', required: false, description: 'Số lượng bản ghi trả về', example: 10 })
    @ApiQuery({ name: 'offset', required: false, description: 'Vị trí bắt đầu', example: 0 })
    @ApiQuery({ name: 'isActive', required: false, description: 'Lọc theo trạng thái hoạt động', example: true })
    @ApiResponse({
        status: 200,
        description: 'Danh sách phòng theo nhóm phòng',
        type: RoomsListResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async getRoomsByGroup(
        @Param('roomGroupId') roomGroupId: string,
        @Query() query: Omit<GetRoomsByGroupDto, 'roomGroupId'>
    ) {
        const result = await this.roomService.getRoomsByGroup({ roomGroupId, ...query });
        return ResponseBuilder.success(result);
    }

    @Get('stats')
    @ApiOperation({
        summary: 'Thống kê phòng',
        description: 'Lấy thống kê tổng quan về phòng.'
    })
    @ApiResponse({
        status: 200,
        description: 'Thống kê phòng',
        schema: {
            type: 'object',
            properties: {
                total: { type: 'number', example: 100 },
                active: { type: 'number', example: 95 },
                inactive: { type: 'number', example: 5 },
                byDepartment: { type: 'object' },
                byRoomGroup: { type: 'object' }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async getRoomStats() {
        const stats = await this.roomService.getRoomStats();
        return ResponseBuilder.success(stats);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Lấy thông tin phòng',
        description: 'Lấy thông tin chi tiết của một phòng theo ID.'
    })
    @ApiParam({ name: 'id', description: 'ID phòng' })
    @ApiResponse({
        status: 200,
        description: 'Thông tin phòng',
        type: RoomResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy phòng' })
    async getRoomById(@Param('id') id: string) {
        const room = await this.roomService.getRoomById(id);
        return ResponseBuilder.success(room);
    }
}
