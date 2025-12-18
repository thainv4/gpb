import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/commands/create-branch.dto';
import { UpdateBranchDto } from './dto/commands/update-branch.dto';
import { GetBranchesDto } from './dto/queries/get-branches.dto';
import { SearchBranchesDto } from './dto/queries/search-branches.dto';
import { GetBranchesByProvinceDto } from './dto/queries/get-branches-by-province.dto';
import { GetBranchesByWardDto } from './dto/queries/get-branches-by-ward.dto';
import { BranchResponseDto } from './dto/responses/branch-response.dto';
import { BranchesListResponseDto } from './dto/responses/branches-list-response.dto';
import { BranchWithLocationResponseDto } from './dto/responses/branch-with-location-response.dto';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';

@ApiTags('Branches')
@ApiBearerAuth('JWT-auth')
@UseGuards(DualAuthGuard)
@Controller('branches')
export class BranchController {
    constructor(private readonly branchService: BranchService) { }

    // ========== COMMAND ENDPOINTS (WRITE OPERATIONS) ==========

    @Post()
    @ApiOperation({
        summary: 'Tạo chi nhánh mới',
        description: 'Tạo một chi nhánh mới với thông tin đầy đủ'
    })
    @ApiResponse({
        status: 201,
        description: 'Chi nhánh được tạo thành công',
        type: BranchResponseDto
    })
    @ApiResponse({
        status: 400,
        description: 'Dữ liệu đầu vào không hợp lệ'
    })
    @ApiResponse({
        status: 409,
        description: 'Chi nhánh với mã/tên/BHYT/số điện thoại đã tồn tại'
    })
    async createBranch(
        @Body() createBranchDto: CreateBranchDto,
        @CurrentUser() currentUser: CurrentUser
    ) {
        const branch = await this.branchService.createBranch(createBranchDto, currentUser.id);
        return ResponseBuilder.success(branch, HttpStatus.CREATED);
    }

    @Put(':id')
    @ApiOperation({
        summary: 'Cập nhật chi nhánh',
        description: 'Cập nhật thông tin chi nhánh theo ID'
    })
    @ApiParam({
        name: 'id',
        description: 'ID của chi nhánh cần cập nhật',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @ApiResponse({
        status: 200,
        description: 'Chi nhánh được cập nhật thành công',
        type: BranchResponseDto
    })
    @ApiResponse({
        status: 400,
        description: 'Dữ liệu đầu vào không hợp lệ'
    })
    @ApiResponse({
        status: 404,
        description: 'Chi nhánh không tồn tại'
    })
    @ApiResponse({
        status: 409,
        description: 'Chi nhánh với mã/tên/BHYT/số điện thoại đã tồn tại'
    })
    async updateBranch(
        @Param('id') id: string,
        @Body() updateBranchDto: UpdateBranchDto,
        @CurrentUser() currentUser: CurrentUser
    ) {
        const branch = await this.branchService.updateBranch(id, updateBranchDto, currentUser.username);
        return ResponseBuilder.success(branch);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Xóa chi nhánh (soft delete)',
        description: 'Xóa mềm chi nhánh theo ID'
    })
    @ApiParam({
        name: 'id',
        description: 'ID của chi nhánh cần xóa',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @ApiResponse({
        status: 204,
        description: 'Chi nhánh được xóa thành công'
    })
    @ApiResponse({
        status: 404,
        description: 'Chi nhánh không tồn tại'
    })
    async deleteBranch(
        @Param('id') id: string,
        @CurrentUser() currentUser: CurrentUser
    ) {
        await this.branchService.deleteBranch(id, currentUser.username);
        return ResponseBuilder.success(null, HttpStatus.NO_CONTENT);
    }

    @Delete(':id/hard')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Xóa cứng chi nhánh',
        description: 'Xóa cứng chi nhánh theo ID (không thể khôi phục)'
    })
    @ApiParam({
        name: 'id',
        description: 'ID của chi nhánh cần xóa cứng',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @ApiResponse({
        status: 204,
        description: 'Chi nhánh được xóa cứng thành công'
    })
    @ApiResponse({
        status: 404,
        description: 'Chi nhánh không tồn tại'
    })
    async hardDeleteBranch(@Param('id') id: string) {
        await this.branchService.hardDeleteBranch(id);
        return ResponseBuilder.success(null, HttpStatus.NO_CONTENT);
    }

    // ========== QUERY ENDPOINTS (READ OPERATIONS) ==========

    @Get()
    @ApiOperation({
        summary: 'Lấy danh sách chi nhánh',
        description: 'Lấy danh sách chi nhánh với phân trang, lọc và sắp xếp'
    })
    @ApiQuery({
        name: 'limit',
        description: 'Số lượng bản ghi trả về',
        required: false,
        type: Number,
        example: 10
    })
    @ApiQuery({
        name: 'offset',
        description: 'Vị trí bắt đầu',
        required: false,
        type: Number,
        example: 0
    })
    @ApiQuery({
        name: 'sortBy',
        description: 'Trường để sắp xếp',
        required: false,
        enum: ['branchName', 'branchCode', 'hospitalLevel', 'createdAt'],
        example: 'branchName'
    })
    @ApiQuery({
        name: 'sortOrder',
        description: 'Thứ tự sắp xếp',
        required: false,
        enum: ['ASC', 'DESC'],
        example: 'ASC'
    })
    @ApiQuery({
        name: 'isActive',
        description: 'Lọc theo trạng thái hoạt động',
        required: false,
        type: Boolean,
        example: true
    })
    @ApiQuery({
        name: 'provinceId',
        description: 'Lọc theo ID tỉnh',
        required: false,
        type: String,
        example: '550e8400-e29b-41d4-a716-446655440001'
    })
    @ApiQuery({
        name: 'wardId',
        description: 'Lọc theo ID xã',
        required: false,
        type: String,
        example: '550e8400-e29b-41d4-a716-446655440101'
    })
    @ApiQuery({
        name: 'hospitalLevel',
        description: 'Lọc theo cấp bệnh viện',
        required: false,
        enum: ['Tuyến 1', 'Tuyến 2', 'Tuyến 3', 'Tuyến 4'],
        example: 'Tuyến 1'
    })
    @ApiQuery({
        name: 'search',
        description: 'Tìm kiếm theo tên, mã, địa chỉ, đại diện',
        required: false,
        type: String,
        example: 'Chi nhánh Hà Nội'
    })
    @ApiResponse({
        status: 200,
        description: 'Danh sách chi nhánh được lấy thành công',
        type: BranchesListResponseDto
    })
    async getBranches(@Query() getBranchesDto: GetBranchesDto) {
        const result = await this.branchService.getBranches(getBranchesDto);
        return ResponseBuilder.success(result);
    }

    @Get('search')
    @ApiOperation({
        summary: 'Tìm kiếm chi nhánh',
        description: 'Tìm kiếm chi nhánh theo từ khóa và loại tìm kiếm'
    })
    @ApiQuery({
        name: 'keyword',
        description: 'Từ khóa tìm kiếm',
        required: true,
        type: String,
        example: 'Chi nhánh Hà Nội'
    })
    @ApiQuery({
        name: 'searchType',
        description: 'Loại tìm kiếm',
        required: false,
        enum: ['name', 'code', 'shortName', 'address', 'phone', 'representative', 'bhy', 'hospitalLevel', 'all'],
        example: 'all'
    })
    @ApiQuery({
        name: 'provinceId',
        description: 'Lọc theo ID tỉnh',
        required: false,
        type: String,
        example: '550e8400-e29b-41d4-a716-446655440001'
    })
    @ApiQuery({
        name: 'wardId',
        description: 'Lọc theo ID xã',
        required: false,
        type: String,
        example: '550e8400-e29b-41d4-a716-446655440101'
    })
    @ApiQuery({
        name: 'hospitalLevel',
        description: 'Lọc theo cấp bệnh viện',
        required: false,
        enum: ['Tuyến 1', 'Tuyến 2', 'Tuyến 3', 'Tuyến 4'],
        example: 'Tuyến 1'
    })
    @ApiQuery({
        name: 'limit',
        description: 'Số lượng bản ghi trả về',
        required: false,
        type: Number,
        example: 10
    })
    @ApiQuery({
        name: 'offset',
        description: 'Vị trí bắt đầu',
        required: false,
        type: Number,
        example: 0
    })
    @ApiResponse({
        status: 200,
        description: 'Kết quả tìm kiếm chi nhánh',
        type: BranchesListResponseDto
    })
    async searchBranches(@Query() searchBranchesDto: SearchBranchesDto) {
        const result = await this.branchService.searchBranches(searchBranchesDto);
        return ResponseBuilder.success(result);
    }

    @Get('province/:provinceId')
    @ApiOperation({
        summary: 'Lấy chi nhánh theo tỉnh',
        description: 'Lấy danh sách chi nhánh thuộc về một tỉnh cụ thể'
    })
    @ApiParam({
        name: 'provinceId',
        description: 'ID của tỉnh',
        example: '550e8400-e29b-41d4-a716-446655440001'
    })
    @ApiQuery({
        name: 'limit',
        description: 'Số lượng bản ghi trả về',
        required: false,
        type: Number,
        example: 10
    })
    @ApiQuery({
        name: 'offset',
        description: 'Vị trí bắt đầu',
        required: false,
        type: Number,
        example: 0
    })
    @ApiQuery({
        name: 'isActive',
        description: 'Lọc theo trạng thái hoạt động',
        required: false,
        type: Boolean,
        example: true
    })
    @ApiQuery({
        name: 'hospitalLevel',
        description: 'Lọc theo cấp bệnh viện',
        required: false,
        enum: ['Tuyến 1', 'Tuyến 2', 'Tuyến 3', 'Tuyến 4'],
        example: 'Tuyến 1'
    })
    @ApiQuery({
        name: 'search',
        description: 'Tìm kiếm theo tên, mã, địa chỉ, đại diện',
        required: false,
        type: String,
        example: 'Chi nhánh Hà Nội'
    })
    @ApiResponse({
        status: 200,
        description: 'Danh sách chi nhánh theo tỉnh',
        type: BranchesListResponseDto
    })
    async getBranchesByProvince(
        @Param('provinceId') provinceId: string,
        @Query() getBranchesByProvinceDto: GetBranchesByProvinceDto
    ) {
        const result = await this.branchService.getBranchesByProvince({
            ...getBranchesByProvinceDto,
            provinceId,
        });
        return ResponseBuilder.success(result);
    }

    @Get('ward/:wardId')
    @ApiOperation({
        summary: 'Lấy chi nhánh theo xã',
        description: 'Lấy danh sách chi nhánh thuộc về một xã cụ thể'
    })
    @ApiParam({
        name: 'wardId',
        description: 'ID của xã',
        example: '550e8400-e29b-41d4-a716-446655440101'
    })
    @ApiQuery({
        name: 'limit',
        description: 'Số lượng bản ghi trả về',
        required: false,
        type: Number,
        example: 10
    })
    @ApiQuery({
        name: 'offset',
        description: 'Vị trí bắt đầu',
        required: false,
        type: Number,
        example: 0
    })
    @ApiQuery({
        name: 'isActive',
        description: 'Lọc theo trạng thái hoạt động',
        required: false,
        type: Boolean,
        example: true
    })
    @ApiQuery({
        name: 'hospitalLevel',
        description: 'Lọc theo cấp bệnh viện',
        required: false,
        enum: ['Tuyến 1', 'Tuyến 2', 'Tuyến 3', 'Tuyến 4'],
        example: 'Tuyến 1'
    })
    @ApiQuery({
        name: 'search',
        description: 'Tìm kiếm theo tên, mã, địa chỉ, đại diện',
        required: false,
        type: String,
        example: 'Chi nhánh Hà Nội'
    })
    @ApiResponse({
        status: 200,
        description: 'Danh sách chi nhánh theo xã',
        type: BranchesListResponseDto
    })
    async getBranchesByWard(
        @Param('wardId') wardId: string,
        @Query() getBranchesByWardDto: GetBranchesByWardDto
    ) {
        const result = await this.branchService.getBranchesByWard({
            ...getBranchesByWardDto,
            wardId,
        });
        return ResponseBuilder.success(result);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Lấy thông tin chi nhánh theo ID',
        description: 'Lấy thông tin chi tiết của một chi nhánh theo ID'
    })
    @ApiParam({
        name: 'id',
        description: 'ID của chi nhánh',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @ApiResponse({
        status: 200,
        description: 'Thông tin chi nhánh',
        type: BranchResponseDto
    })
    @ApiResponse({
        status: 404,
        description: 'Chi nhánh không tồn tại'
    })
    async getBranchById(@Param('id') id: string) {
        const branch = await this.branchService.getBranchById(id);
        return ResponseBuilder.success(branch);
    }

    // ========== UTILITY ENDPOINTS ==========

    @Get('stats/overview')
    @ApiOperation({
        summary: 'Lấy thống kê tổng quan chi nhánh',
        description: 'Lấy thống kê tổng quan về số lượng chi nhánh theo các tiêu chí'
    })
    @ApiResponse({
        status: 200,
        description: 'Thống kê tổng quan chi nhánh',
        schema: {
            type: 'object',
            properties: {
                totalBranches: { type: 'number', example: 100 },
                activeBranches: { type: 'number', example: 95 },
                inactiveBranches: { type: 'number', example: 5 },
                softDeletedBranches: { type: 'number', example: 0 },
                branchesByLevel: {
                    type: 'object',
                    example: {
                        'Tuyến 1': 20,
                        'Tuyến 2': 30,
                        'Tuyến 3': 40,
                        'Tuyến 4': 10
                    }
                }
            }
        }
    })
    async getBranchStats() {
        const stats = await this.branchService.getBranchStats();
        return ResponseBuilder.success(stats);
    }
}
