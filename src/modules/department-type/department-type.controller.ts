import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DepartmentTypeService } from './department-type.service';
import { CreateDepartmentTypeDto } from './dto/commands/create-department-type.dto';
import { UpdateDepartmentTypeDto } from './dto/commands/update-department-type.dto';
import { DeleteDepartmentTypeDto } from './dto/commands/delete-department-type.dto';
import { GetDepartmentTypesDto } from './dto/queries/get-department-types.dto';
import { GetDepartmentTypeByIdDto } from './dto/queries/get-department-type-by-id.dto';
import { SearchDepartmentTypesDto } from './dto/queries/search-department-types.dto';
import { DepartmentTypeResponseDto } from './dto/responses/department-type-response.dto';
import { DepartmentTypesListResponseDto } from './dto/responses/department-types-list-response.dto';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Department Types')
@Controller('department-types')
@UseGuards(DualAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DepartmentTypeController {
    constructor(private readonly departmentTypeService: DepartmentTypeService) { }

    // ========== COMMAND ENDPOINTS (Write Operations) ==========

    @Post()
    @ApiOperation({
        summary: 'Tạo loại khoa mới',
        description: 'Tạo một loại khoa mới trong hệ thống'
    })
    @ApiBody({ type: CreateDepartmentTypeDto })
    @ApiResponse({
        status: 201,
        description: 'Loại khoa được tạo thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 201 },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    @ApiResponse({ status: 409, description: 'Mã loại khoa đã tồn tại' })
    async createDepartmentType(
        @Body() createDepartmentTypeDto: CreateDepartmentTypeDto,
        @CurrentUser() currentUser: CurrentUser
    ) {
        

        const id = await this.departmentTypeService.createDepartmentType(createDepartmentTypeDto, currentUser);
        return ResponseBuilder.success({ id }, 201);
    }

    @Put(':id')
    @ApiOperation({
        summary: 'Cập nhật loại khoa',
        description: 'Cập nhật thông tin loại khoa'
    })
    @ApiParam({ name: 'id', description: 'ID loại khoa' })
    @ApiBody({ type: UpdateDepartmentTypeDto })
    @ApiResponse({
        status: 200,
        description: 'Loại khoa được cập nhật thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 200 },
                data: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Department type updated successfully' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy loại khoa' })
    async updateDepartmentType(
        @Param('id') id: string,
        @Body() updateDepartmentTypeDto: UpdateDepartmentTypeDto,
        @CurrentUser() currentUser: CurrentUser
    ) {
        

        await this.departmentTypeService.updateDepartmentType(id, updateDepartmentTypeDto, currentUser);
        return ResponseBuilder.success({ message: 'Department type updated successfully' });
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Xóa loại khoa',
        description: 'Xóa loại khoa (soft delete)'
    })
    @ApiParam({ name: 'id', description: 'ID loại khoa' })
    @ApiQuery({ name: 'hardDelete', description: 'Xóa vĩnh viễn', required: false, type: Boolean })
    @ApiResponse({
        status: 200,
        description: 'Loại khoa được xóa thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 200 },
                data: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Department type deleted successfully' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy loại khoa' })
    async deleteDepartmentType(
        @Param('id') id: string,
        @Query('hardDelete') hardDelete?: string
    ) {
        const deleteDepartmentTypeDto: DeleteDepartmentTypeDto = {
            id,
            hardDelete: hardDelete === 'true',
        };

        await this.departmentTypeService.deleteDepartmentType(deleteDepartmentTypeDto.id);
        return ResponseBuilder.success({ message: 'Department type deleted successfully' });
    }

    // ========== QUERY ENDPOINTS (Read Operations) ==========

    @Get()
    @ApiOperation({
        summary: 'Lấy danh sách loại khoa',
        description: 'Lấy danh sách loại khoa với phân trang và tìm kiếm'
    })
    @ApiResponse({
        status: 200,
        description: 'Danh sách loại khoa được trả về thành công',
        type: DepartmentTypesListResponseDto
    })
    @ApiResponse({ status: 400, description: 'Tham số truy vấn không hợp lệ' })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async getDepartmentTypes(@Query() query: GetDepartmentTypesDto) {
        const result = await this.departmentTypeService.getDepartmentTypes(query);
        return ResponseBuilder.success(result);
    }

    @Get('search')
    @ApiOperation({
        summary: 'Tìm kiếm loại khoa',
        description: 'Tìm kiếm loại khoa theo từ khóa'
    })
    @ApiResponse({
        status: 200,
        description: 'Kết quả tìm kiếm được trả về thành công',
        type: DepartmentTypesListResponseDto
    })
    @ApiResponse({ status: 400, description: 'Từ khóa tìm kiếm không hợp lệ' })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async searchDepartmentTypes(@Query() searchDepartmentTypesDto: SearchDepartmentTypesDto) {
        const result = await this.departmentTypeService.getDepartmentTypes({
            limit: searchDepartmentTypesDto.limit,
            offset: searchDepartmentTypesDto.offset,
            search: searchDepartmentTypesDto.keyword,
            isActive: searchDepartmentTypesDto.isActive,
            sortBy: searchDepartmentTypesDto.sortBy as any,
            sortOrder: searchDepartmentTypesDto.sortOrder as any,
        });
        return ResponseBuilder.success(result);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Lấy chi tiết loại khoa',
        description: 'Lấy thông tin chi tiết của một loại khoa'
    })
    @ApiParam({ name: 'id', description: 'ID loại khoa' })
    @ApiQuery({ name: 'includeDeleted', description: 'Bao gồm bản ghi đã xóa', required: false, type: Boolean })
    @ApiResponse({
        status: 200,
        description: 'Chi tiết loại khoa được trả về thành công',
        type: DepartmentTypeResponseDto
    })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy loại khoa' })
    async getDepartmentTypeById(
        @Param('id') id: string,
        @Query('includeDeleted') includeDeleted?: string
    ) {
        const getDepartmentTypeByIdDto: GetDepartmentTypeByIdDto = {
            id,
            includeDeleted: includeDeleted === 'true',
        };

        const result = await this.departmentTypeService.getDepartmentTypeById(id);
        return ResponseBuilder.success(result);
    }

    // ========== UTILITY ENDPOINTS ==========

    @Get('stats/overview')
    @ApiOperation({
        summary: 'Lấy thống kê tổng quan',
        description: 'Lấy thống kê tổng quan về số lượng loại khoa'
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
                        total: { type: 'number', example: 10 },
                        active: { type: 'number', example: 8 },
                        inactive: { type: 'number', example: 2 },
                        activePercentage: { type: 'number', example: 80 }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async getDepartmentTypesStats() {
        const result = await this.departmentTypeService.getStatsOverview();
        return ResponseBuilder.success(result);
    }

    @Post('reorder')
    @ApiOperation({
        summary: 'Sắp xếp lại thứ tự loại khoa',
        description: 'Sắp xếp lại thứ tự hiển thị của các loại khoa'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                departmentTypeIds: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['id1', 'id2', 'id3']
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Thứ tự loại khoa được sắp xếp lại thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 200 },
                data: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Department types reordered successfully' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async reorderDepartmentTypes() {
        await this.departmentTypeService.reorderDepartmentTypes([]);
        return ResponseBuilder.success({ message: 'Department types reordered successfully' });
    }

    // ========== DATALOADER ENDPOINTS ==========

    @Get('with-stats')
    @ApiOperation({
        summary: 'Lấy danh sách loại khoa với thống kê',
        description: 'Lấy danh sách loại khoa kèm theo thống kê (sử dụng DataLoader để tối ưu performance)'
    })
    @ApiResponse({
        status: 200,
        description: 'Danh sách loại khoa với thống kê được trả về thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 200 },
                data: {
                    type: 'object',
                    properties: {
                        departmentTypes: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440001' },
                                    typeCode: { type: 'string', example: 'KHOA' },
                                    typeName: { type: 'string', example: 'Khoa' },
                                    description: { type: 'string', example: 'Các khoa chuyên môn' },
                                    displayName: { type: 'string', example: 'KHOA - Khoa' },
                                    sortOrder: { type: 'number', example: 1 },
                                    isActive: { type: 'boolean', example: true },
                                    // departmentsCount: { type: 'number', example: 5 }
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
    async getDepartmentTypesWithStats(@Query() query: GetDepartmentTypesDto) {
        const result = await this.departmentTypeService.getDepartmentTypesWithStats(query);
        return ResponseBuilder.success(result);
    }
}
