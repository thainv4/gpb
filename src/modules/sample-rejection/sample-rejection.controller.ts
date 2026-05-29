import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SampleRejectionService } from './sample-rejection.service';
import { CreateSampleRejectionDto } from './dto/commands/create-sample-rejection.dto';
import { UpdateSampleRejectionDto } from './dto/commands/update-sample-rejection.dto';
import { GetSampleRejectionsDto } from './dto/queries/get-sample-rejections.dto';
import { SampleRejectionResponseDto } from './dto/responses/sample-rejection-response.dto';
import { SampleRejectionsListResponseDto } from './dto/responses/sample-rejections-list-response.dto';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser as ICurrentUser } from '../../common/interfaces/current-user.interface';

@ApiTags('Sample Rejections')
@Controller('sample-rejections')
@UseGuards(DualAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SampleRejectionController {
    constructor(private readonly sampleRejectionService: SampleRejectionService) { }

    @Post()
    @ApiOperation({ summary: 'Tạo bản ghi từ chối bệnh phẩm' })
    @ApiBody({ type: CreateSampleRejectionDto })
    @ApiResponse({ status: 201, description: 'Tạo thành công' })
    async create(
        @Body() createDto: CreateSampleRejectionDto,
        @CurrentUser() currentUser: ICurrentUser,
    ) {
        const id = await this.sampleRejectionService.create(createDto, currentUser);
        return ResponseBuilder.success({ id }, HttpStatus.CREATED);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật bản ghi từ chối bệnh phẩm' })
    @ApiParam({ name: 'id', description: 'ID bản ghi' })
    @ApiBody({ type: UpdateSampleRejectionDto })
    @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy bản ghi' })
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateSampleRejectionDto,
        @CurrentUser() currentUser: ICurrentUser,
    ) {
        await this.sampleRejectionService.update(id, updateDto, currentUser);
        return ResponseBuilder.success({ message: 'Sample rejection updated successfully' });
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa bản ghi từ chối bệnh phẩm' })
    @ApiParam({ name: 'id', description: 'ID bản ghi' })
    @ApiResponse({ status: 200, description: 'Xóa thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy bản ghi' })
    async delete(@Param('id') id: string) {
        await this.sampleRejectionService.delete(id);
        return ResponseBuilder.success({ message: 'Sample rejection deleted successfully' });
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách từ chối bệnh phẩm' })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'offset', required: false })
    @ApiQuery({ name: 'search', required: false, description: 'Tìm theo họ tên hoặc mã bệnh phẩm' })
    @ApiResponse({ status: 200, description: 'Danh sách', type: SampleRejectionsListResponseDto })
    async getList(@Query() query: GetSampleRejectionsDto) {
        const result = await this.sampleRejectionService.getList(query);
        return ResponseBuilder.success(result);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết bản ghi từ chối bệnh phẩm' })
    @ApiParam({ name: 'id', description: 'ID bản ghi' })
    @ApiResponse({ status: 200, description: 'Chi tiết', type: SampleRejectionResponseDto })
    @ApiResponse({ status: 404, description: 'Không tìm thấy bản ghi' })
    async getById(@Param('id') id: string) {
        const item = await this.sampleRejectionService.getById(id);
        return ResponseBuilder.success(item);
    }
}
