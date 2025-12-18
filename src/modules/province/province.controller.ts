import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProvinceService } from './province.service';
import { CreateProvinceDto } from './dto/commands/create-province.dto';
import { UpdateProvinceDto } from './dto/commands/update-province.dto';
import { DeleteProvinceDto } from './dto/commands/delete-province.dto';
import { GetProvincesDto } from './dto/queries/get-provinces.dto';
import { GetProvinceByIdDto } from './dto/queries/get-province-by-id.dto';
import { SearchProvincesDto } from './dto/queries/search-provinces.dto';
import { ProvinceResponseDto } from './dto/responses/province-response.dto';
import { ProvincesListResponseDto } from './dto/responses/provinces-list-response.dto';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Provinces')
@Controller('provinces')
@UseGuards(DualAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ProvinceController {
    constructor(private readonly provinceService: ProvinceService) { }

    // ========== COMMAND ENDPOINTS (Write Operations) ==========

    @Post()
    @ApiOperation({
        summary: 'Tạo tỉnh mới',
        description: 'Tạo một tỉnh thành mới trong hệ thống'
    })
    @ApiBody({ type: CreateProvinceDto })
    @ApiResponse({
        status: 201,
        description: 'Tỉnh được tạo thành công',
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
    @ApiResponse({ status: 409, description: 'Mã tỉnh, tên tỉnh hoặc tên viết tắt đã tồn tại' })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async createProvince(
        @Body() createProvinceDto: CreateProvinceDto, 
        @CurrentUser() currentUser: CurrentUser
    ) {
        const provinceId = await this.provinceService.createProvince(createProvinceDto, currentUser);
        return ResponseBuilder.success({ id: provinceId }, 201);
    }

    @Put(':id')
    @ApiOperation({
        summary: 'Cập nhật thông tin tỉnh',
        description: 'Cập nhật thông tin của một tỉnh thành'
    })
    @ApiParam({ name: 'id', description: 'ID của tỉnh cần cập nhật', example: '550e8400-e29b-41d4-a716-446655440000' })
    @ApiBody({ type: UpdateProvinceDto })
    @ApiResponse({
        status: 200,
        description: 'Tỉnh được cập nhật thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 200 },
                data: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Tỉnh được cập nhật thành công' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy tỉnh' })
    @ApiResponse({ status: 409, description: 'Mã tỉnh, tên tỉnh hoặc tên viết tắt đã tồn tại' })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async updateProvince(
        @Param('id') id: string,
        @Body() updateProvinceDto: UpdateProvinceDto,
        @CurrentUser() currentUser: CurrentUser
    ) {
        await this.provinceService.updateProvince(id, updateProvinceDto, currentUser);
        return ResponseBuilder.success({ message: 'Tỉnh được cập nhật thành công' });
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Xóa tỉnh',
        description: 'Xóa một tỉnh thành khỏi hệ thống (soft delete hoặc hard delete)'
    })
    @ApiParam({ name: 'id', description: 'ID của tỉnh cần xóa', example: '550e8400-e29b-41d4-a716-446655440000' })
    @ApiQuery({ name: 'hardDelete', description: 'Xóa cứng hay xóa mềm', required: false, type: 'boolean', example: false })
    @ApiResponse({
        status: 200,
        description: 'Tỉnh được xóa thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 200 },
                data: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Tỉnh được xóa thành công' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 404, description: 'Không tìm thấy tỉnh' })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async deleteProvince(
        @Param('id') id: string,
        @Query('hardDelete') hardDelete: string,
        @Request() req: Request & { user: any }
    ) {
        const currentUser = {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
        };

        const deleteProvinceDto: DeleteProvinceDto = {
            id,
            hardDelete: hardDelete === 'true',
        };

        await this.provinceService.deleteProvince(deleteProvinceDto.id);
        return ResponseBuilder.success({ message: 'Tỉnh được xóa thành công' });
    }

    // ========== QUERY ENDPOINTS (Read Operations) ==========

    @Get()
    @ApiOperation({
        summary: 'Lấy danh sách tỉnh',
        description: 'Lấy danh sách tất cả các tỉnh thành với phân trang và bộ lọc'
    })
    @ApiQuery({ name: 'limit', description: 'Số lượng bản ghi trả về', required: false, type: 'number', example: 10 })
    @ApiQuery({ name: 'offset', description: 'Vị trí bắt đầu', required: false, type: 'number', example: 0 })
    @ApiQuery({ name: 'sortBy', description: 'Trường để sắp xếp', required: false, enum: ['sortOrder', 'provinceName', 'provinceCode', 'createdAt'], example: 'sortOrder' })
    @ApiQuery({ name: 'sortOrder', description: 'Thứ tự sắp xếp', required: false, enum: ['ASC', 'DESC'], example: 'ASC' })
    @ApiQuery({ name: 'isActive', description: 'Lọc theo trạng thái hoạt động', required: false, type: 'boolean', example: true })
    @ApiQuery({ name: 'search', description: 'Tìm kiếm theo tên, mã hoặc tên viết tắt', required: false, type: 'string', example: 'Hà Nội' })
    @ApiResponse({
        status: 200,
        description: 'Danh sách tỉnh được trả về thành công',
        type: ProvincesListResponseDto
    })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async getProvinces(@Query() getProvincesDto: GetProvincesDto) {
        const result = await this.provinceService.getProvinces(getProvincesDto);
        return ResponseBuilder.success(result);
    }

    @Get('search')
    @ApiOperation({
        summary: 'Tìm kiếm tỉnh',
        description: 'Tìm kiếm tỉnh theo từ khóa với các loại tìm kiếm khác nhau'
    })
    @ApiQuery({ name: 'keyword', description: 'Từ khóa tìm kiếm', required: true, type: 'string', example: 'Hà Nội' })
    @ApiQuery({ name: 'searchType', description: 'Loại tìm kiếm', required: false, enum: ['name', 'code', 'shortName', 'all'], example: 'all' })
    @ApiQuery({ name: 'limit', description: 'Số lượng bản ghi trả về', required: false, type: 'number', example: 10 })
    @ApiQuery({ name: 'offset', description: 'Vị trí bắt đầu', required: false, type: 'number', example: 0 })
    @ApiQuery({ name: 'sortBy', description: 'Trường để sắp xếp', required: false, enum: ['sortOrder', 'provinceName', 'provinceCode', 'createdAt'], example: 'sortOrder' })
    @ApiQuery({ name: 'sortOrder', description: 'Thứ tự sắp xếp', required: false, enum: ['ASC', 'DESC'], example: 'ASC' })
    @ApiResponse({
        status: 200,
        description: 'Kết quả tìm kiếm tỉnh',
        type: ProvincesListResponseDto
    })
    @ApiResponse({ status: 400, description: 'Từ khóa tìm kiếm không hợp lệ' })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async searchProvinces(@Query() searchProvincesDto: SearchProvincesDto) {
        const result = await this.provinceService.getProvinces({
            limit: searchProvincesDto.limit,
            offset: searchProvincesDto.offset,
            search: searchProvincesDto.keyword,
            isActive: undefined,
            sortBy: searchProvincesDto.sortBy as any,
            sortOrder: searchProvincesDto.sortOrder as any,
        });
        return ResponseBuilder.success(result);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Lấy thông tin tỉnh theo ID',
        description: 'Lấy thông tin chi tiết của một tỉnh thành theo ID'
    })
    @ApiParam({ name: 'id', description: 'ID của tỉnh cần lấy thông tin', example: '550e8400-e29b-41d4-a716-446655440000' })
    @ApiQuery({ name: 'includeDeleted', description: 'Bao gồm cả các bản ghi đã bị xóa mềm', required: false, type: 'boolean', example: false })
    @ApiResponse({
        status: 200,
        description: 'Thông tin tỉnh được trả về thành công',
        type: ProvinceResponseDto
    })
    @ApiResponse({ status: 404, description: 'Không tìm thấy tỉnh' })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async getProvinceById(
        @Param('id') id: string,
        @Query('includeDeleted') includeDeleted: string
    ) {
        const getProvinceByIdDto: GetProvinceByIdDto = {
            id,
            includeDeleted: includeDeleted === 'true',
        };

        const result = await this.provinceService.getProvinceById(id);
        return ResponseBuilder.success(result);
    }

    // ========== UTILITY ENDPOINTS ==========

    @Get('stats/overview')
    @ApiOperation({
        summary: 'Lấy thống kê tổng quan',
        description: 'Lấy thống kê tổng quan về số lượng tỉnh thành'
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
                        total: { type: 'number', example: 63 },
                        active: { type: 'number', example: 60 },
                        inactive: { type: 'number', example: 3 }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async getProvincesStats() {
        const result = await this.provinceService.getStatsOverview();
        return ResponseBuilder.success(result);
    }

    @Post('reorder')
    @ApiOperation({
        summary: 'Sắp xếp lại thứ tự tỉnh',
        description: 'Sắp xếp lại thứ tự của tất cả các tỉnh thành'
    })
    @ApiResponse({
        status: 200,
        description: 'Thứ tự tỉnh được sắp xếp lại thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 200 },
                data: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Thứ tự tỉnh được sắp xếp lại thành công' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async reorderProvinces() {
        await this.provinceService.reorderProvinces([]);
        return ResponseBuilder.success({ message: 'Thứ tự tỉnh được sắp xếp lại thành công' });
    }

    // ========== DATALOADER ENDPOINTS ==========

    @Get('with-wards')
    @ApiOperation({
        summary: 'Lấy danh sách tỉnh với xã phường',
        description: 'Lấy danh sách tỉnh kèm theo danh sách xã phường của từng tỉnh (sử dụng DataLoader để tối ưu performance)'
    })
    @ApiResponse({
        status: 200,
        description: 'Danh sách tỉnh với xã phường được trả về thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 200 },
                data: {
                    type: 'object',
                    properties: {
                        provinces: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
                                    provinceCode: { type: 'string', example: 'HN' },
                                    provinceName: { type: 'string', example: 'Hà Nội' },
                                    shortName: { type: 'string', example: 'Hà Nội' },
                                    sortOrder: { type: 'number', example: 1 },
                                    isActive: { type: 'boolean', example: true },
                                    wards: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'string' },
                                                wardCode: { type: 'string' },
                                                wardName: { type: 'string' },
                                                shortName: { type: 'string' },
                                                sortOrder: { type: 'number' },
                                                isActive: { type: 'boolean' }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        total: { type: 'number', example: 10 },
                        limit: { type: 'number', example: 10 },
                        offset: { type: 'number', example: 0 }
                    }
                }
            }
        }
    })
    async getProvincesWithWards(@Query() query: GetProvincesDto) {
        const result = await this.provinceService.getProvincesWithWards(query);
        return ResponseBuilder.success(result);
    }

    @Get('with-branches')
    @ApiOperation({
        summary: 'Lấy danh sách tỉnh với chi nhánh',
        description: 'Lấy danh sách tỉnh kèm theo danh sách chi nhánh của từng tỉnh (sử dụng DataLoader để tối ưu performance)'
    })
    @ApiResponse({
        status: 200,
        description: 'Danh sách tỉnh với chi nhánh được trả về thành công'
    })
    async getProvincesWithBranches(@Query() query: GetProvincesDto) {
        const result = await this.provinceService.getProvincesWithBranches(query);
        return ResponseBuilder.success(result);
    }
}
