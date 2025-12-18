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
    HttpStatus,
    BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ResultTemplateService } from './result-template.service';
import { CreateResultTemplateDto } from './dto/commands/create-result-template.dto';
import { UpdateResultTemplateDto } from './dto/commands/update-result-template.dto';
import { GetResultTemplatesDto } from './dto/queries/get-result-templates.dto';
import { SearchResultTemplatesDto } from './dto/queries/search-result-templates.dto';
import { ResultTemplateResponseDto } from './dto/responses/result-template-response.dto';
import { ResultTemplatesListResponseDto } from './dto/responses/result-templates-list-response.dto';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';

@ApiTags('Result Templates')
@ApiBearerAuth('JWT-auth')
@UseGuards(DualAuthGuard)
@Controller('result-templates')
export class ResultTemplateController {
    constructor(private readonly resultTemplateService: ResultTemplateService) { }

    // ========== COMMAND ENDPOINTS (WRITE OPERATIONS) ==========

    @Post()
    @ApiOperation({
        summary: 'Tạo mẫu kết quả mới',
        description: 'Tạo một mẫu kết quả xét nghiệm mới'
    })
    @ApiResponse({
        status: 201,
        description: 'Mẫu kết quả được tạo thành công',
        type: ResultTemplateResponseDto
    })
    @ApiResponse({
        status: 400,
        description: 'Dữ liệu đầu vào không hợp lệ'
    })
    @ApiResponse({
        status: 409,
        description: 'Mẫu kết quả đã tồn tại'
    })
    async createResultTemplate(
        @Body() createResultTemplateDto: CreateResultTemplateDto,
        @CurrentUser() currentUser: CurrentUser | null,
    ) {
        if (!currentUser) {
            throw new BadRequestException('JWT authentication required for creating result templates. HIS token is not supported for write operations.');
        }
        const resultTemplate = await this.resultTemplateService.createResultTemplate(
            createResultTemplateDto,
            currentUser
        );
        return ResponseBuilder.success(resultTemplate, HttpStatus.CREATED);
    }

    @Put(':id')
    @ApiOperation({
        summary: 'Cập nhật mẫu kết quả',
        description: 'Cập nhật thông tin mẫu kết quả theo ID'
    })
    @ApiParam({
        name: 'id',
        description: 'ID của mẫu kết quả cần cập nhật',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @ApiResponse({
        status: 200,
        description: 'Mẫu kết quả được cập nhật thành công',
        type: ResultTemplateResponseDto
    })
    @ApiResponse({
        status: 400,
        description: 'Dữ liệu đầu vào không hợp lệ'
    })
    @ApiResponse({
        status: 404,
        description: 'Mẫu kết quả không tồn tại'
    })
    @ApiResponse({
        status: 409,
        description: 'Mẫu kết quả đã tồn tại'
    })
    async updateResultTemplate(
        @Param('id') id: string,
        @Body() updateResultTemplateDto: UpdateResultTemplateDto,
        @CurrentUser() currentUser: CurrentUser | null,
    ) {
        if (!currentUser) {
            throw new BadRequestException('JWT authentication required for updating result templates. HIS token is not supported for write operations.');
        }
        await this.resultTemplateService.updateResultTemplate(
            id,
            updateResultTemplateDto,
            currentUser
        );
        return ResponseBuilder.success({ message: 'Result template updated successfully' });
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Xóa mẫu kết quả',
        description: 'Xóa mềm mẫu kết quả theo ID'
    })
    @ApiParam({
        name: 'id',
        description: 'ID của mẫu kết quả cần xóa',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @ApiResponse({
        status: 200,
        description: 'Mẫu kết quả được xóa thành công'
    })
    @ApiResponse({
        status: 404,
        description: 'Mẫu kết quả không tồn tại'
    })
    async deleteResultTemplate(@Param('id') id: string) {
        await this.resultTemplateService.deleteResultTemplate(id);
        return ResponseBuilder.success({ message: 'Result template deleted successfully' });
    }

    // ========== QUERY ENDPOINTS (READ OPERATIONS) ==========

    @Get(':id')
    @ApiOperation({
        summary: 'Lấy thông tin mẫu kết quả theo ID',
        description: 'Lấy chi tiết thông tin mẫu kết quả theo ID'
    })
    @ApiParam({
        name: 'id',
        description: 'ID của mẫu kết quả',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @ApiResponse({
        status: 200,
        description: 'Lấy thông tin mẫu kết quả thành công',
        type: ResultTemplateResponseDto
    })
    @ApiResponse({
        status: 404,
        description: 'Mẫu kết quả không tồn tại'
    })
    async getResultTemplateById(@Param('id') id: string) {
        const resultTemplate = await this.resultTemplateService.getResultTemplateById(id);
        return ResponseBuilder.success(resultTemplate);
    }

    @Get()
    @ApiOperation({
        summary: 'Lấy danh sách mẫu kết quả',
        description: 'Lấy danh sách mẫu kết quả với phân trang và sắp xếp'
    })
    @ApiResponse({
        status: 200,
        description: 'Lấy danh sách mẫu kết quả thành công',
        type: ResultTemplatesListResponseDto
    })
    async getAllResultTemplates(@Query() getResultTemplatesDto: GetResultTemplatesDto) {
        const resultTemplates = await this.resultTemplateService.getAllResultTemplates(
            getResultTemplatesDto
        );
        return ResponseBuilder.success(resultTemplates);
    }

    @Get('search/keyword')
    @ApiOperation({
        summary: 'Tìm kiếm mẫu kết quả',
        description: 'Tìm kiếm mẫu kết quả theo từ khóa với phân trang'
    })
    @ApiResponse({
        status: 200,
        description: 'Tìm kiếm mẫu kết quả thành công',
        type: ResultTemplatesListResponseDto
    })
    async searchResultTemplates(@Query() searchResultTemplatesDto: SearchResultTemplatesDto) {
        const resultTemplates = await this.resultTemplateService.searchResultTemplates(
            searchResultTemplatesDto
        );
        return ResponseBuilder.success(resultTemplates);
    }
}

