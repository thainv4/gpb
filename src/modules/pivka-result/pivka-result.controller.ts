import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { PivkaResultService } from './pivka-result.service';
import { CreatePivkaIiResultDto } from './dto/commands/create-pivka-ii-result.dto';
import { UpdatePivkaIiResultDto } from './dto/commands/update-pivka-ii-result.dto';
import { GetPivkaIiResultsDto } from './dto/queries/get-pivka-ii-results.dto';
import { PivkaIiResultResponseDto } from './dto/responses/pivka-ii-result-response.dto';
import { PivkaIiResultsListResponseDto } from './dto/responses/pivka-ii-results-list-response.dto';

@ApiTags('Pivka-II Results')
@ApiBearerAuth('JWT-auth')
@Controller('pivka-ii-results')
@UseGuards(DualAuthGuard)
export class PivkaResultController {
    constructor(private readonly service: PivkaResultService) { }

    @Post()
    @ApiOperation({ summary: 'Tạo kết quả PIVKA-II/AFP' })
    @ApiBody({ type: CreatePivkaIiResultDto })
    @ApiResponse({ status: 201, type: Object })
    async create(
        @Body() dto: CreatePivkaIiResultDto,
        @CurrentUser() currentUser: CurrentUser
    ) {
        const id = await this.service.create(dto, currentUser);
        return ResponseBuilder.success({ id }, 201);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật kết quả PIVKA-II/AFP' })
    @ApiParam({ name: 'id', description: 'UUID' })
    @ApiBody({ type: UpdatePivkaIiResultDto })
    @ApiResponse({ status: 200 })
    async update(
        @Param('id') id: string,
        @Body() dto: UpdatePivkaIiResultDto,
        @CurrentUser() currentUser: CurrentUser
    ) {
        await this.service.update(id, dto, currentUser);
        return ResponseBuilder.success({ message: 'Updated' });
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa kết quả PIVKA-II/AFP (soft delete mặc định)' })
    @ApiParam({ name: 'id', description: 'UUID' })
    @ApiResponse({ status: 200 })
    async delete(
        @Param('id') id: string,
        @Query('hardDelete') hardDelete: string,
        @CurrentUser() currentUser: CurrentUser
    ) {
        await this.service.delete(id, hardDelete === 'true', currentUser);
        return ResponseBuilder.success({ message: 'Deleted' });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Chi tiết kết quả PIVKA-II/AFP theo ID' })
    @ApiParam({ name: 'id', description: 'UUID' })
    @ApiResponse({ status: 200, type: PivkaIiResultResponseDto })
    async getById(@Param('id') id: string) {
        const data = await this.service.getById(id);
        return ResponseBuilder.success(data);
    }

    @Get()
    @ApiOperation({ summary: 'Danh sách kết quả PIVKA-II/AFP' })
    @ApiResponse({ status: 200, type: PivkaIiResultsListResponseDto })
    async getAll(@Query() query: GetPivkaIiResultsDto) {
        const data = await this.service.getAll(query);
        return ResponseBuilder.success(data);
    }
}

