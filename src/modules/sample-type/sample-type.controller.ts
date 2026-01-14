import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SampleTypeService } from './sample-type.service';
import { CreateSampleTypeDto } from './dto/commands/create-sample-type.dto';
import { UpdateSampleTypeDto } from './dto/commands/update-sample-type.dto';
import { GetSampleTypesDto } from './dto/queries/get-sample-types.dto';
import { SearchSampleTypesDto } from './dto/queries/search-sample-types.dto';
import { SampleTypeResponseDto } from './dto/responses/sample-type-response.dto';
import { SampleTypesListResponseDto } from './dto/responses/sample-types-list-response.dto';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser as ICurrentUser } from '../../common/interfaces/current-user.interface';

@ApiTags('Sample Types')
@Controller('sample-types')
@UseGuards(DualAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SampleTypeController {
    constructor(private readonly sampleTypeService: SampleTypeService) { }

    // ========== COMMAND ENDPOINTS (Write Operations) ==========

    @Post()
    @ApiOperation({
        summary: 'Tạo loại mẫu mới',
        description: 'Tạo một loại mẫu mới trong hệ thống'
    })
    @ApiBody({ type: CreateSampleTypeDto })
    @ApiResponse({
        status: 201,
        description: 'Loại mẫu được tạo thành công',
        type: SampleTypeResponseDto
    })
    @ApiResponse({
        status: 400,
        description: 'Dữ liệu đầu vào không hợp lệ'
    })
    @ApiResponse({
        status: 409,
        description: 'Loại mẫu với mã/tên đã tồn tại'
    })
    async createSampleType(
        @Body() createDto: CreateSampleTypeDto,
        @CurrentUser() currentUser: ICurrentUser
    ) {
        const sampleTypeId = await this.sampleTypeService.createSampleType(createDto, currentUser);
        return ResponseBuilder.success({ id: sampleTypeId }, HttpStatus.CREATED);
    }

    @Put(':id')
    @ApiOperation({
        summary: 'Cập nhật loại mẫu',
        description: 'Cập nhật thông tin loại mẫu'
    })
    @ApiParam({ name: 'id', description: 'ID loại mẫu' })
    @ApiBody({ type: UpdateSampleTypeDto })
    @ApiResponse({
        status: 200,
        description: 'Loại mẫu được cập nhật thành công'
    })
    @ApiResponse({
        status: 404,
        description: 'Không tìm thấy loại mẫu'
    })
    @ApiResponse({
        status: 409,
        description: 'Loại mẫu với mã/tên đã tồn tại'
    })
    async updateSampleType(
        @Param('id') id: string,
        @Body() updateDto: UpdateSampleTypeDto,
        @CurrentUser() currentUser: ICurrentUser
    ) {
        await this.sampleTypeService.updateSampleType(id, updateDto, currentUser);
        return ResponseBuilder.success({ message: 'Sample type updated successfully' });
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Xóa loại mẫu',
        description: 'Xóa loại mẫu khỏi hệ thống'
    })
    @ApiParam({ name: 'id', description: 'ID loại mẫu' })
    @ApiResponse({
        status: 200,
        description: 'Loại mẫu được xóa thành công'
    })
    @ApiResponse({
        status: 404,
        description: 'Không tìm thấy loại mẫu'
    })
    async deleteSampleType(@Param('id') id: string) {
        await this.sampleTypeService.deleteSampleType(id);
        return ResponseBuilder.success({ message: 'Sample type deleted successfully' });
    }

    // ========== QUERY ENDPOINTS (Read Operations) ==========

    @Get()
    @ApiOperation({
        summary: 'Lấy danh sách loại mẫu',
        description: 'Lấy danh sách loại mẫu với phân trang và tìm kiếm'
    })
    @ApiResponse({
        status: 200,
        description: 'Danh sách loại mẫu',
        type: SampleTypesListResponseDto
    })
    async getSampleTypes(@Query() query: GetSampleTypesDto) {
        const result = await this.sampleTypeService.getSampleTypes(query);
        return ResponseBuilder.success(result);
    }

    @Get('active')
    @ApiOperation({
        summary: 'Lấy danh sách loại mẫu đang hoạt động',
        description: 'Lấy danh sách loại mẫu đang hoạt động, sắp xếp theo thứ tự'
    })
    @ApiResponse({
        status: 200,
        description: 'Danh sách loại mẫu đang hoạt động',
        type: [SampleTypeResponseDto]
    })
    async getActiveSampleTypes() {
        const sampleTypes = await this.sampleTypeService.getActiveSampleTypes();
        return ResponseBuilder.success(sampleTypes);
    }

    @Get('search')
    @ApiOperation({
        summary: 'Tìm kiếm loại mẫu',
        description: 'Tìm kiếm loại mẫu theo từ khóa'
    })
    @ApiQuery({ name: 'q', description: 'Từ khóa tìm kiếm' })
    @ApiResponse({
        status: 200,
        description: 'Kết quả tìm kiếm loại mẫu',
        type: [SampleTypeResponseDto]
    })
    async searchSampleTypes(@Query() searchDto: SearchSampleTypesDto) {
        const sampleTypes = await this.sampleTypeService.searchSampleTypes(searchDto.q);
        return ResponseBuilder.success(sampleTypes);
    }

    @Get('by-type-name/:typeName')
    @ApiOperation({
        summary: 'Tìm kiếm loại mẫu theo tên',
        description: 'Tìm kiếm danh sách loại mẫu có chứa chuỗi TypeName (không phân biệt chữ hoa, chữ thường). Ví dụ: tìm "te" sẽ trả về tất cả loại mẫu như "Test", "Testosterone"'
    })
    @ApiParam({ name: 'typeName', description: 'Chuỗi tìm kiếm trong tên loại mẫu (không phân biệt chữ hoa, chữ thường)' })
    @ApiResponse({
        status: 200,
        description: 'Danh sách loại mẫu',
        type: [SampleTypeResponseDto]
    })
    async getSampleTypeByTypeName(@Param('typeName') typeName: string) {
        const sampleTypes = await this.sampleTypeService.getSampleTypeByTypeName(typeName);
        return ResponseBuilder.success(sampleTypes);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Lấy thông tin loại mẫu',
        description: 'Lấy thông tin chi tiết loại mẫu theo ID'
    })
    @ApiParam({ name: 'id', description: 'ID loại mẫu' })
    @ApiResponse({
        status: 200,
        description: 'Thông tin loại mẫu',
        type: SampleTypeResponseDto
    })
    @ApiResponse({
        status: 404,
        description: 'Không tìm thấy loại mẫu'
    })
    async getSampleTypeById(@Param('id') id: string) {
        const sampleType = await this.sampleTypeService.getSampleTypeById(id);
        return ResponseBuilder.success(sampleType);
    }
}
