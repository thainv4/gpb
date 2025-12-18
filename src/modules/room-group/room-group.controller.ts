import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RoomGroupService } from './room-group.service';
import { CreateRoomGroupDto } from './dto/commands/create-room-group.dto';
import { UpdateRoomGroupDto } from './dto/commands/update-room-group.dto';
import { GetRoomGroupsDto } from './dto/queries/get-room-groups.dto';
import { GetRoomGroupByIdDto } from './dto/queries/get-room-group-by-id.dto';
import { SearchRoomGroupsDto } from './dto/queries/search-room-groups.dto';
import { RoomGroupResponseDto } from './dto/responses/room-group-response.dto';
import { RoomGroupsListResponseDto } from './dto/responses/room-groups-list-response.dto';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Room Groups')
@Controller('room-groups')
@UseGuards(DualAuthGuard)
@ApiBearerAuth('JWT-auth')
export class RoomGroupController {
    constructor(private readonly roomGroupService: RoomGroupService) { }

    // ========== COMMAND ENDPOINTS ==========

    @Post()
    @ApiOperation({ summary: 'Tạo nhóm phòng mới', description: 'Tạo một nhóm phòng mới với mã và tên.' })
    @ApiBody({ type: CreateRoomGroupDto })
    @ApiResponse({
        status: 201,
        description: 'Nhóm phòng được tạo thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 201 },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' },
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    @ApiResponse({ status: 409, description: 'Mã nhóm phòng hoặc tên nhóm phòng đã tồn tại' })
    async createRoomGroup(
        @Body() createDto: CreateRoomGroupDto,
        @CurrentUser() currentUser: CurrentUser
    ) {
        const id = await this.roomGroupService.createRoomGroup(createDto, currentUser);
        return ResponseBuilder.success({ id }, 201);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật nhóm phòng', description: 'Cập nhật thông tin của một nhóm phòng hiện có.' })
    @ApiParam({ name: 'id', description: 'ID của nhóm phòng cần cập nhật' })
    @ApiBody({ type: UpdateRoomGroupDto })
    @ApiResponse({
        status: 200,
        description: 'Nhóm phòng được cập nhật thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 200 },
                data: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Room group updated successfully' },
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy nhóm phòng' })
    @ApiResponse({ status: 409, description: 'Mã nhóm phòng hoặc tên nhóm phòng đã tồn tại' })
    async updateRoomGroup(
        @Param('id') id: string,
        @Body() updateDto: UpdateRoomGroupDto,
        @CurrentUser() currentUser: CurrentUser
    ) {
        await this.roomGroupService.updateRoomGroup(id, updateDto, currentUser);
        return ResponseBuilder.success({ message: 'Room group updated successfully' });
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa nhóm phòng', description: 'Xóa mềm hoặc xóa cứng một nhóm phòng.' })
    @ApiParam({ name: 'id', description: 'ID của nhóm phòng cần xóa' })
    @ApiQuery({ name: 'hardDelete', type: 'boolean', required: false, description: 'Xóa cứng khỏi DB nếu true (mặc định là xóa mềm)' })
    @ApiResponse({
        status: 200,
        description: 'Nhóm phòng được xóa thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 200 },
                data: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Room group deleted successfully' },
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy nhóm phòng' })
    async deleteRoomGroup(
        @Param('id') id: string,
        @Query('hardDelete') hardDelete?: string
    ) {
        await this.roomGroupService.deleteRoomGroup(id, hardDelete === 'true');
        return ResponseBuilder.success({ message: 'Room group deleted successfully' });
    }

    // ========== QUERY ENDPOINTS ==========

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách nhóm phòng', description: 'Lấy danh sách tất cả các nhóm phòng có phân trang, tìm kiếm và lọc.' })
    @ApiQuery({ type: GetRoomGroupsDto })
    @ApiResponse({ status: 200, description: 'Danh sách nhóm phòng được trả về thành công', type: RoomGroupsListResponseDto })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async getRoomGroups(@Query() query: GetRoomGroupsDto) {
        const result = await this.roomGroupService.getRoomGroups(query);
        return ResponseBuilder.success(result);
    }

    @Get('search')
    @ApiOperation({ summary: 'Tìm kiếm nhóm phòng', description: 'Tìm kiếm nhóm phòng theo từ khóa (mã, tên).' })
    @ApiQuery({ type: SearchRoomGroupsDto })
    @ApiResponse({ status: 200, description: 'Kết quả tìm kiếm nhóm phòng được trả về thành công', type: RoomGroupsListResponseDto })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async searchRoomGroups(@Query() query: SearchRoomGroupsDto) {
        const result = await this.roomGroupService.searchRoomGroups(query);
        return ResponseBuilder.success(result);
    }

    @Get('with-stats')
    @ApiOperation({ summary: 'Lấy danh sách nhóm phòng với thống kê', description: 'Lấy danh sách nhóm phòng kèm theo các thống kê liên quan (sử dụng DataLoader để tối ưu performance).' })
    @ApiQuery({ type: GetRoomGroupsDto })
    @ApiResponse({ status: 200, description: 'Danh sách nhóm phòng với thống kê được trả về thành công', type: RoomGroupsListResponseDto })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async getRoomGroupsWithStats(@Query() query: GetRoomGroupsDto) {
        const result = await this.roomGroupService.getRoomGroupsWithStats(query);
        return ResponseBuilder.success(result);
    }

    @Get('stats/overview')
    @ApiOperation({ summary: 'Thống kê tổng quan nhóm phòng', description: 'Lấy thống kê tổng quan về số lượng nhóm phòng.' })
    @ApiResponse({
        status: 200,
        description: 'Thống kê tổng quan được trả về thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 200 },
                data: {
                    type: 'object',
                    properties: {
                        total: { type: 'number', example: 10 },
                        active: { type: 'number', example: 8 },
                        inactive: { type: 'number', example: 2 },
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async getStatsOverview() {
        const result = await this.roomGroupService.getStatsOverview();
        return ResponseBuilder.success(result);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết nhóm phòng', description: 'Lấy thông tin chi tiết của một nhóm phòng bằng ID.' })
    @ApiParam({ name: 'id', description: 'ID của nhóm phòng' })
    @ApiQuery({ name: 'includeDeleted', type: 'boolean', required: false, description: 'Bao gồm cả các bản ghi đã xóa mềm' })
    @ApiResponse({ status: 200, description: 'Chi tiết nhóm phòng được trả về thành công', type: RoomGroupResponseDto })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy nhóm phòng' })
    async getRoomGroupById(
        @Param('id') id: string,
        @Query('includeDeleted') includeDeleted?: string
    ) {
        const result = await this.roomGroupService.getRoomGroupById(id);
        return ResponseBuilder.success(result);
    }

    @Post('reorder')
    @ApiOperation({ summary: 'Sắp xếp lại thứ tự nhóm phòng', description: 'Sắp xếp lại thứ tự hiển thị của các nhóm phòng.' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                roomGroupIds: {
                    type: 'array',
                    items: { type: 'string', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' },
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Thứ tự nhóm phòng được sắp xếp lại thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 200 },
                data: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Thứ tự nhóm phòng được sắp xếp lại thành công' },
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async reorderRoomGroups(@Body('roomGroupIds') roomGroupIds: string[]) {
        await this.roomGroupService.reorderRoomGroups(roomGroupIds);
        return ResponseBuilder.success({ message: 'Thứ tự nhóm phòng được sắp xếp lại thành công' });
    }
}
