import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/commands/create-department.dto';
import { UpdateDepartmentDto } from './dto/commands/update-department.dto';
import { GetDepartmentsDto } from './dto/queries/get-departments.dto';
import { SearchDepartmentsDto } from './dto/queries/search-departments.dto';
import { DepartmentResponseDto } from './dto/responses/department-response.dto';
import { DepartmentsListResponseDto } from './dto/responses/departments-list-response.dto';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PublicGuard } from '../../common/guards/public.guard';

@ApiTags('Departments')
@Controller('departments')
@UseGuards(PublicGuard)
export class DepartmentController {
    constructor(private readonly departmentService: DepartmentService) { }

    // ========== COMMAND ENDPOINTS ==========

    @Post()
    @UseGuards(DualAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Tạo khoa mới', description: 'Tạo một khoa mới với mã, tên và các thông tin liên quan.' })
    @ApiBody({ type: CreateDepartmentDto })
    @ApiResponse({
        status: 201,
        description: 'Khoa được tạo thành công',
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
    @ApiResponse({ status: 409, description: 'Mã khoa đã tồn tại' })
    async createDepartment(
        @Body() createDto: CreateDepartmentDto,
        @CurrentUser() currentUser: CurrentUser
    ) {
        
        const id = await this.departmentService.createDepartment(createDto, currentUser);
        return ResponseBuilder.success({ id }, 201);
    }

    @Put(':id')
    @UseGuards(DualAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Cập nhật khoa', description: 'Cập nhật thông tin của một khoa hiện có.' })
    @ApiParam({ name: 'id', description: 'ID của khoa cần cập nhật' })
    @ApiBody({ type: UpdateDepartmentDto })
    @ApiResponse({
        status: 200,
        description: 'Khoa được cập nhật thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 200 },
                data: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Department updated successfully' },
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy khoa' })
    @ApiResponse({ status: 409, description: 'Mã khoa hoặc tên khoa đã tồn tại' })
    async updateDepartment(
        @Param('id') id: string,
        @Body() updateDto: UpdateDepartmentDto,
        @CurrentUser() currentUser: CurrentUser
    ) {
        
        await this.departmentService.updateDepartment(id, updateDto, currentUser);
        return ResponseBuilder.success({ message: 'Department updated successfully' });
    }

    @Delete(':id')
    @UseGuards(DualAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Xóa khoa', description: 'Xóa mềm hoặc xóa cứng một khoa.' })
    @ApiParam({ name: 'id', description: 'ID của khoa cần xóa' })
    @ApiQuery({ name: 'hardDelete', type: 'boolean', required: false, description: 'Xóa cứng khỏi DB nếu true (mặc định là xóa mềm)' })
    @ApiResponse({
        status: 200,
        description: 'Khoa được xóa thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 200 },
                data: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Department deleted successfully' },
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy khoa' })
    @ApiResponse({ status: 409, description: 'Không thể xóa khoa có khoa con' })
    async deleteDepartment(
        @Param('id') id: string,
        @Query('hardDelete') hardDelete?: string
    ) {
        await this.departmentService.deleteDepartment(id, hardDelete === 'true');
        return ResponseBuilder.success({ message: 'Department deleted successfully' });
    }

    // ========== QUERY ENDPOINTS ==========

    @Get()
    @ApiOperation({ 
        summary: 'Lấy danh sách khoa', 
        description: 'Lấy danh sách tất cả các khoa có phân trang, tìm kiếm và lọc. This endpoint is public and does not require authentication.' 
    })
    @ApiQuery({ type: GetDepartmentsDto })
    @ApiResponse({ status: 200, description: 'Danh sách khoa được trả về thành công', type: DepartmentsListResponseDto })
    async getDepartments(@Query() query: GetDepartmentsDto) {
        const result = await this.departmentService.getDepartments(query);
        return ResponseBuilder.success(result);
    }

    @Get('search')
    @UseGuards(DualAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Tìm kiếm khoa', description: 'Tìm kiếm khoa theo từ khóa (mã, tên, trưởng khoa, điều dưỡng trưởng).' })
    @ApiQuery({ type: SearchDepartmentsDto })
    @ApiResponse({ status: 200, description: 'Kết quả tìm kiếm khoa được trả về thành công', type: DepartmentsListResponseDto })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async searchDepartments(@Query() query: SearchDepartmentsDto) {
        const result = await this.departmentService.searchDepartments(query);
        return ResponseBuilder.success(result);
    }

    @Get('by-branch/:branchId')
    @UseGuards(DualAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Lấy khoa theo chi nhánh', description: 'Lấy danh sách khoa của một chi nhánh cụ thể.' })
    @ApiParam({ name: 'branchId', description: 'ID của chi nhánh' })
    @ApiResponse({ status: 200, description: 'Danh sách khoa theo chi nhánh được trả về thành công', type: [DepartmentResponseDto] })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async getDepartmentsByBranch(@Param('branchId') branchId: string) {
        const result = await this.departmentService.getDepartmentsByBranch(branchId);
        return ResponseBuilder.success(result);
    }

    @Get('by-type/:typeId')
    @UseGuards(DualAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Lấy khoa theo loại khoa', description: 'Lấy danh sách khoa của một loại khoa cụ thể.' })
    @ApiParam({ name: 'typeId', description: 'ID của loại khoa' })
    @ApiResponse({ status: 200, description: 'Danh sách khoa theo loại khoa được trả về thành công', type: [DepartmentResponseDto] })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async getDepartmentsByType(@Param('typeId') typeId: string) {
        const result = await this.departmentService.getDepartmentsByType(typeId);
        return ResponseBuilder.success(result);
    }

    @Get('hierarchy')
    @UseGuards(DualAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Lấy cây phân cấp khoa', description: 'Lấy danh sách các khoa gốc (không có khoa cha) để xây dựng cây phân cấp.' })
    @ApiResponse({ status: 200, description: 'Cây phân cấp khoa được trả về thành công', type: [DepartmentResponseDto] })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async getDepartmentHierarchy() {
        const result = await this.departmentService.getDepartmentHierarchy();
        return ResponseBuilder.success(result);
    }

    @Get(':id/children')
    @UseGuards(DualAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Lấy khoa con', description: 'Lấy danh sách khoa con của một khoa cụ thể.' })
    @ApiParam({ name: 'id', description: 'ID của khoa cha' })
    @ApiResponse({ status: 200, description: 'Danh sách khoa con được trả về thành công', type: [DepartmentResponseDto] })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy khoa' })
    async getDepartmentChildren(@Param('id') id: string) {
        const result = await this.departmentService.getDepartmentChildren(id);
        return ResponseBuilder.success(result);
    }

    @Get('with-stats')
    @UseGuards(DualAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Lấy danh sách khoa với thống kê', description: 'Lấy danh sách khoa kèm theo các thống kê liên quan (sử dụng DataLoader để tối ưu performance).' })
    @ApiQuery({ type: GetDepartmentsDto })
    @ApiResponse({ status: 200, description: 'Danh sách khoa với thống kê được trả về thành công', type: DepartmentsListResponseDto })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async getDepartmentsWithStats(@Query() query: GetDepartmentsDto) {
        const result = await this.departmentService.getDepartmentsWithStats(query);
        return ResponseBuilder.success(result);
    }

    @Get(':id')
    @UseGuards(DualAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Lấy chi tiết khoa', description: 'Lấy thông tin chi tiết của một khoa bằng ID.' })
    @ApiParam({ name: 'id', description: 'ID của khoa' })
    @ApiQuery({ name: 'includeDeleted', type: 'boolean', required: false, description: 'Bao gồm cả các bản ghi đã xóa mềm' })
    @ApiResponse({ status: 200, description: 'Chi tiết khoa được trả về thành công', type: DepartmentResponseDto })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy khoa' })
    async getDepartmentById(
        @Param('id') id: string,
        @Query('includeDeleted') includeDeleted?: string
    ) {
        const result = await this.departmentService.getDepartmentById(id);
        return ResponseBuilder.success(result);
    }

    // ========== STATISTICS ENDPOINTS ==========

    @Get('stats/overview')
    @UseGuards(DualAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Thống kê tổng quan khoa', description: 'Lấy thống kê tổng quan về số lượng khoa.' })
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
        const result = await this.departmentService.getStatsOverview();
        return ResponseBuilder.success(result);
    }

    @Get('stats/by-branch/:branchId')
    @UseGuards(DualAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Thống kê khoa theo chi nhánh', description: 'Lấy thống kê khoa của một chi nhánh cụ thể.' })
    @ApiParam({ name: 'branchId', description: 'ID của chi nhánh' })
    @ApiResponse({
        status: 200,
        description: 'Thống kê khoa theo chi nhánh được trả về thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 200 },
                data: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' },
                        total: { type: 'number', example: 5 },
                        active: { type: 'number', example: 4 },
                        inactive: { type: 'number', example: 1 },
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async getStatsByBranch(@Param('branchId') branchId: string) {
        const result = await this.departmentService.getStatsByBranch(branchId);
        return ResponseBuilder.success(result);
    }

    @Get('stats/by-type/:typeId')
    @UseGuards(DualAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Thống kê khoa theo loại khoa', description: 'Lấy thống kê khoa của một loại khoa cụ thể.' })
    @ApiParam({ name: 'typeId', description: 'ID của loại khoa' })
    @ApiResponse({
        status: 200,
        description: 'Thống kê khoa theo loại khoa được trả về thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 200 },
                data: {
                    type: 'object',
                    properties: {
                        departmentTypeId: { type: 'string', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' },
                        total: { type: 'number', example: 3 },
                        active: { type: 'number', example: 3 },
                        inactive: { type: 'number', example: 0 },
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async getStatsByType(@Param('typeId') typeId: string) {
        const result = await this.departmentService.getStatsByType(typeId);
        return ResponseBuilder.success(result);
    }

    // ========== UTILITY ENDPOINTS ==========

    @Post('reorder')
    @UseGuards(DualAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Sắp xếp lại thứ tự khoa', description: 'Sắp xếp lại thứ tự hiển thị của các khoa.' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                departmentIds: {
                    type: 'array',
                    items: { type: 'string', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' },
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Thứ tự khoa được sắp xếp lại thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 200 },
                data: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Thứ tự khoa được sắp xếp lại thành công' },
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
    async reorderDepartments(@Body('departmentIds') departmentIds: string[]) {
        await this.departmentService.reorderDepartments(departmentIds);
        return ResponseBuilder.success({ message: 'Thứ tự khoa được sắp xếp lại thành công' });
    }
}
