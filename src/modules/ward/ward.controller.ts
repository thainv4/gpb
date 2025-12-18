import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { WardService } from './ward.service';
import { CreateWardDto } from './dto/commands/create-ward.dto';
import { UpdateWardDto } from './dto/commands/update-ward.dto';
import { DeleteWardDto } from './dto/commands/delete-ward.dto';
import { GetWardsDto } from './dto/queries/get-wards.dto';
import { GetWardByIdDto } from './dto/queries/get-ward-by-id.dto';
import { SearchWardsDto } from './dto/queries/search-wards.dto';
import { GetWardsByProvinceDto } from './dto/queries/get-wards-by-province.dto';
import { WardResponseDto } from './dto/responses/ward-response.dto';
import { WardsListResponseDto } from './dto/responses/wards-list-response.dto';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Wards')
@Controller('wards')
@UseGuards(DualAuthGuard)
@ApiBearerAuth('JWT-auth')
export class WardController {
    constructor(private readonly wardService: WardService) { }

    // ========== COMMAND ENDPOINTS (Write Operations) ==========

    @Post()
    @ApiOperation({
        summary: 'Tạo xã mới',
        description: 'Tạo một xã mới trong hệ thống'
    })
    @ApiBody({ type: CreateWardDto })
    @ApiResponse({
        status: 201,
        description: 'Xã được tạo thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 201 },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
    @ApiResponse({ status: 404, description: 'Tỉnh không tồn tại' })
    @ApiResponse({ status: 409, description: 'Mã xã, tên xã hoặc tên viết tắt đã tồn tại' })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async createWard(
        @Body() createWardDto: CreateWardDto,
        @CurrentUser() currentUser: CurrentUser
    ) {
        const wardId = await this.wardService.createWard(createWardDto, currentUser);
        return ResponseBuilder.success({ id: wardId }, 201);
    }

    @Put(':id')
    @ApiOperation({
        summary: 'Cập nhật thông tin xã',
        description: 'Cập nhật thông tin của một xã'
    })
    @ApiParam({ name: 'id', description: 'ID của xã cần cập nhật', example: '550e8400-e29b-41d4-a716-446655440000' })
    @ApiBody({ type: UpdateWardDto })
    @ApiResponse({
        status: 200,
        description: 'Xã được cập nhật thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 200 },
                data: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Xã được cập nhật thành công' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy xã hoặc tỉnh' })
    @ApiResponse({ status: 409, description: 'Mã xã, tên xã hoặc tên viết tắt đã tồn tại' })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async updateWard(
        @Param('id') id: string,
        @Body() updateWardDto: UpdateWardDto,
        @CurrentUser() currentUser: CurrentUser
    ) {
        await this.wardService.updateWard(id, updateWardDto, currentUser);
        return ResponseBuilder.success({ message: 'Xã được cập nhật thành công' });
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Xóa xã',
        description: 'Xóa một xã khỏi hệ thống (soft delete hoặc hard delete)'
    })
    @ApiParam({ name: 'id', description: 'ID của xã cần xóa', example: '550e8400-e29b-41d4-a716-446655440000' })
    @ApiQuery({ name: 'hardDelete', description: 'Xóa cứng hay xóa mềm', required: false, type: 'boolean', example: false })
    @ApiResponse({
        status: 200,
        description: 'Xã được xóa thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 200 },
                data: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Xã được xóa thành công' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 404, description: 'Không tìm thấy xã' })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async deleteWard(
        @Param('id') id: string,
        @Query('hardDelete') hardDelete: string,
        @Request() req: Request & { user: any }
    ) {
        const currentUser = {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
        };

        const deleteWardDto: DeleteWardDto = {
            id,
            hardDelete: hardDelete === 'true',
        };

        await this.wardService.deleteWard(deleteWardDto, currentUser);
        return ResponseBuilder.success({ message: 'Xã được xóa thành công' });
    }

    // ========== QUERY ENDPOINTS (Read Operations) ==========

    @Get()
    @ApiOperation({
        summary: 'Lấy danh sách xã',
        description: 'Lấy danh sách tất cả các xã với phân trang và bộ lọc'
    })
    @ApiQuery({ name: 'limit', description: 'Số lượng bản ghi trả về', required: false, type: 'number', example: 10 })
    @ApiQuery({ name: 'offset', description: 'Vị trí bắt đầu', required: false, type: 'number', example: 0 })
    @ApiQuery({ name: 'sortBy', description: 'Trường để sắp xếp', required: false, enum: ['sortOrder', 'wardName', 'wardCode', 'createdAt'], example: 'sortOrder' })
    @ApiQuery({ name: 'sortOrder', description: 'Thứ tự sắp xếp', required: false, enum: ['ASC', 'DESC'], example: 'ASC' })
    @ApiQuery({ name: 'isActive', description: 'Lọc theo trạng thái hoạt động', required: false, type: 'boolean', example: true })
    @ApiQuery({ name: 'provinceId', description: 'Lọc theo ID tỉnh', required: false, type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' })
    @ApiQuery({ name: 'search', description: 'Tìm kiếm theo tên, mã hoặc tên viết tắt', required: false, type: 'string', example: 'Phúc Xá' })
    @ApiResponse({
        status: 200,
        description: 'Danh sách xã được trả về thành công',
        type: WardsListResponseDto
    })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async getWards(@Query() getWardsDto: GetWardsDto) {
        const result = await this.wardService.getWards(getWardsDto);
        return ResponseBuilder.success(result);
    }

    @Get('search')
    @ApiOperation({
        summary: 'Tìm kiếm xã',
        description: 'Tìm kiếm xã theo từ khóa với các loại tìm kiếm khác nhau'
    })
    @ApiQuery({ name: 'keyword', description: 'Từ khóa tìm kiếm', required: true, type: 'string', example: 'Phúc Xá' })
    @ApiQuery({ name: 'searchType', description: 'Loại tìm kiếm', required: false, enum: ['name', 'code', 'shortName', 'all'], example: 'all' })
    @ApiQuery({ name: 'provinceId', description: 'Lọc theo ID tỉnh', required: false, type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' })
    @ApiQuery({ name: 'limit', description: 'Số lượng bản ghi trả về', required: false, type: 'number', example: 10 })
    @ApiQuery({ name: 'offset', description: 'Vị trí bắt đầu', required: false, type: 'number', example: 0 })
    @ApiQuery({ name: 'sortBy', description: 'Trường để sắp xếp', required: false, enum: ['sortOrder', 'wardName', 'wardCode', 'createdAt'], example: 'sortOrder' })
    @ApiQuery({ name: 'sortOrder', description: 'Thứ tự sắp xếp', required: false, enum: ['ASC', 'DESC'], example: 'ASC' })
    @ApiResponse({
        status: 200,
        description: 'Kết quả tìm kiếm xã',
        type: WardsListResponseDto
    })
    @ApiResponse({ status: 400, description: 'Từ khóa tìm kiếm không hợp lệ' })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async searchWards(@Query() searchWardsDto: SearchWardsDto) {
        const result = await this.wardService.searchWards(searchWardsDto);
        return ResponseBuilder.success(result);
    }

    @Get('province/:provinceId')
    @ApiOperation({
        summary: 'Lấy danh sách xã theo tỉnh',
        description: 'Lấy danh sách các xã thuộc về một tỉnh cụ thể'
    })
    @ApiParam({ name: 'provinceId', description: 'ID của tỉnh', example: '550e8400-e29b-41d4-a716-446655440001' })
    @ApiQuery({ name: 'limit', description: 'Số lượng bản ghi trả về', required: false, type: 'number', example: 10 })
    @ApiQuery({ name: 'offset', description: 'Vị trí bắt đầu', required: false, type: 'number', example: 0 })
    @ApiQuery({ name: 'sortBy', description: 'Trường để sắp xếp', required: false, enum: ['sortOrder', 'wardName', 'wardCode', 'createdAt'], example: 'sortOrder' })
    @ApiQuery({ name: 'sortOrder', description: 'Thứ tự sắp xếp', required: false, enum: ['ASC', 'DESC'], example: 'ASC' })
    @ApiQuery({ name: 'isActive', description: 'Lọc theo trạng thái hoạt động', required: false, type: 'boolean', example: true })
    @ApiQuery({ name: 'search', description: 'Tìm kiếm theo tên, mã hoặc tên viết tắt', required: false, type: 'string', example: 'Phúc Xá' })
    @ApiResponse({
        status: 200,
        description: 'Danh sách xã theo tỉnh được trả về thành công',
        type: WardsListResponseDto
    })
    @ApiResponse({ status: 404, description: 'Không tìm thấy tỉnh' })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async getWardsByProvince(
        @Param('provinceId') provinceId: string,
        @Query() getWardsByProvinceDto: Omit<GetWardsByProvinceDto, 'provinceId'>
    ) {
        const result = await this.wardService.getWardsByProvince({
            ...getWardsByProvinceDto,
            provinceId,
        });
        return ResponseBuilder.success(result);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Lấy thông tin xã theo ID',
        description: 'Lấy thông tin chi tiết của một xã theo ID'
    })
    @ApiParam({ name: 'id', description: 'ID của xã cần lấy thông tin', example: '550e8400-e29b-41d4-a716-446655440000' })
    @ApiQuery({ name: 'includeDeleted', description: 'Bao gồm cả các bản ghi đã bị xóa mềm', required: false, type: 'boolean', example: false })
    @ApiResponse({
        status: 200,
        description: 'Thông tin xã được trả về thành công',
        type: WardResponseDto
    })
    @ApiResponse({ status: 404, description: 'Không tìm thấy xã' })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async getWardById(
        @Param('id') id: string,
        @Query('includeDeleted') includeDeleted: string
    ) {
        const getWardByIdDto: GetWardByIdDto = {
            id,
            includeDeleted: includeDeleted === 'true',
        };

        const result = await this.wardService.getWardById(getWardByIdDto);
        return ResponseBuilder.success(result);
    }

    // ========== UTILITY ENDPOINTS ==========

    @Get('stats/overview')
    @ApiOperation({
        summary: 'Lấy thống kê tổng quan',
        description: 'Lấy thống kê tổng quan về số lượng xã'
    })
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
                        total: { type: 'number', example: 1000 },
                        active: { type: 'number', example: 950 },
                        inactive: { type: 'number', example: 50 }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async getWardsStats() {
        const result = await this.wardService.getWardsStats();
        return ResponseBuilder.success(result);
    }

    @Get('stats/province/:provinceId')
    @ApiOperation({
        summary: 'Lấy thống kê xã theo tỉnh',
        description: 'Lấy thống kê số lượng xã của một tỉnh cụ thể'
    })
    @ApiParam({ name: 'provinceId', description: 'ID của tỉnh', example: '550e8400-e29b-41d4-a716-446655440001' })
    @ApiResponse({
        status: 200,
        description: 'Thống kê xã theo tỉnh được trả về thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 200 },
                data: {
                    type: 'object',
                    properties: {
                        total: { type: 'number', example: 30 },
                        active: { type: 'number', example: 28 },
                        inactive: { type: 'number', example: 2 }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 404, description: 'Không tìm thấy tỉnh' })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async getWardsStatsByProvince(@Param('provinceId') provinceId: string) {
        const result = await this.wardService.getWardsStatsByProvince(provinceId);
        return ResponseBuilder.success(result);
    }

    @Post('reorder')
    @ApiOperation({
        summary: 'Sắp xếp lại thứ tự xã',
        description: 'Sắp xếp lại thứ tự của tất cả các xã hoặc xã trong một tỉnh'
    })
    @ApiQuery({ name: 'provinceId', description: 'ID của tỉnh (tùy chọn)', required: false, type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' })
    @ApiResponse({
        status: 200,
        description: 'Thứ tự xã được sắp xếp lại thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 200 },
                data: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Thứ tự xã được sắp xếp lại thành công' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async reorderWards(@Query('provinceId') provinceId?: string) {
        await this.wardService.reorderWards(provinceId);
        return ResponseBuilder.success({ message: 'Thứ tự xã được sắp xếp lại thành công' });
    }
}
