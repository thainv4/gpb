import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SampleReceptionService } from './sample-reception.service';
import { CreateSampleReceptionDto } from './dto/commands/create-sample-reception.dto';
import { GetSampleReceptionsDto } from './dto/queries/get-sample-receptions.dto';
import { GenerateCodeDto } from './dto/queries/generate-code.dto';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser as ICurrentUser } from '../../common/interfaces/current-user.interface';

@ApiTags('Sample Receptions')
@Controller('sample-receptions')
@UseGuards(DualAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SampleReceptionController {
    constructor(private readonly sampleReceptionService: SampleReceptionService) { }

    // ========== COMMAND ENDPOINTS (Write Operations) ==========

    @Post()
    @ApiOperation({
        summary: 'Tạo mã tiếp nhận mẫu mới',
        description: 'Tạo mã tiếp nhận mẫu mới với format: {LOẠI_MẪU}.{YYYYMMDD}.{SỐ_THỨ_TỰ}'
    })
    @ApiBody({ type: CreateSampleReceptionDto })
    @ApiResponse({
        status: 201,
        description: 'Mã tiếp nhận được tạo thành công',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                status_code: { type: 'number' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        receptionCode: { type: 'string', example: 'BLOOD.20241024.0001' }
                    }
                }
            }
        }
    })
    async createSampleReception(
        @Body() createDto: CreateSampleReceptionDto,
        @CurrentUser() currentUser: ICurrentUser
    ) {
        const receptionId = await this.sampleReceptionService.createSampleReception(createDto, currentUser);

        // Lấy mã tiếp nhận vừa tạo để trả về
        const reception = await this.sampleReceptionService.getSampleReceptionById(receptionId);

        return ResponseBuilder.success({
            id: receptionId,
            receptionCode: reception.receptionCode
        }, HttpStatus.CREATED);
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Xóa mã tiếp nhận',
        description: 'Xóa mã tiếp nhận khỏi hệ thống'
    })
    @ApiParam({ name: 'id', description: 'ID của mã tiếp nhận' })
    async deleteSampleReception(@Param('id') id: string) {
        await this.sampleReceptionService.deleteSampleReception(id);
        return ResponseBuilder.success({ message: 'Sample reception deleted successfully' });
    }

    // ========== QUERY ENDPOINTS (Read Operations) ==========

    @Get()
    @ApiOperation({
        summary: 'Lấy danh sách mã tiếp nhận',
        description: 'Lấy danh sách mã tiếp nhận với phân trang và tìm kiếm'
    })
    async getSampleReceptions(@Query() query: GetSampleReceptionsDto) {
        const result = await this.sampleReceptionService.getSampleReceptions(query);
        return ResponseBuilder.success(result);
    }

    @Get('today')
    @ApiOperation({
        summary: 'Lấy danh sách mã tiếp nhận hôm nay',
        description: 'Lấy danh sách mã tiếp nhận được tạo trong ngày hôm nay'
    })
    async getTodayReceptions() {
        const receptions = await this.sampleReceptionService.getTodayReceptions();
        return ResponseBuilder.success(receptions);
    }

    @Get('generate-code')
    @ApiOperation({
        summary: 'Xem trước mã tiếp nhận',
        description: 'Xem trước mã tiếp nhận sẽ được sinh cho loại mẫu và ngày cụ thể'
    })
    @ApiQuery({ name: 'sampleTypeCode', description: 'Mã loại mẫu', example: 'BLOOD' })
    @ApiQuery({ name: 'date', description: 'Ngày sinh mã (YYYY-MM-DD)', example: '2024-10-24', required: false })
    async generateCodePreview(@Query() query: GenerateCodeDto) {
        const result = await this.sampleReceptionService.generateCodePreview(query);
        return ResponseBuilder.success(result);
    }

    @Get('config/:sampleTypeId')
    @ApiOperation({
        summary: 'Lấy cấu hình sinh mã',
        description: 'Lấy cấu hình sinh mã của loại mẫu cụ thể'
    })
    @ApiParam({ name: 'sampleTypeId', description: 'ID của loại mẫu' })
    async getCodeGenerationConfig(@Param('sampleTypeId') sampleTypeId: string) {
        const config = await this.sampleReceptionService.getCodeGenerationConfig(sampleTypeId);
        return ResponseBuilder.success(config);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Lấy thông tin mã tiếp nhận',
        description: 'Lấy thông tin chi tiết mã tiếp nhận theo ID'
    })
    @ApiParam({ name: 'id', description: 'ID của mã tiếp nhận' })
    async getSampleReceptionById(@Param('id') id: string) {
        const reception = await this.sampleReceptionService.getSampleReceptionById(id);
        return ResponseBuilder.success(reception);
    }
}
