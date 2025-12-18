import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UnitOfMeasureService } from './unit-of-measure.service';
import { CreateUnitOfMeasureDto } from './dto/commands/create-unit-of-measure.dto';
import { UpdateUnitOfMeasureDto } from './dto/commands/update-unit-of-measure.dto';
import { GetUnitsOfMeasureDto } from './dto/queries/get-units-of-measure.dto';
import { UnitOfMeasureResponseDto, GetUnitsOfMeasureResult } from './dto/responses/unit-of-measure-response.dto';
import { ResponseBuilder } from '../../common/builders/response.builder';

@ApiTags('units-of-measure')
@ApiBearerAuth('JWT-auth')
@Controller('units-of-measure')
export class UnitOfMeasureController {
    constructor(private readonly service: UnitOfMeasureService) { }

    @Get()
    @ApiOperation({ summary: 'Danh sách đơn vị tính' })
    @ApiResponse({ status: 200 })
    async getAll(@Query() query: GetUnitsOfMeasureDto) {
        const result = await this.service.getAll(query);
        return ResponseBuilder.success({ items: result.items, pagination: { total: result.total, limit: result.limit, offset: result.offset, hasNext: result.offset + result.limit < result.total, hasPrev: result.offset > 0 } });
    }

    @Post()
    @ApiOperation({ summary: 'Tạo đơn vị tính' })
    @ApiResponse({ status: 201 })
    async create(@Body() dto: CreateUnitOfMeasureDto) {
        const id = await this.service.create(dto);
        return ResponseBuilder.success({ id }, 201);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Chi tiết đơn vị tính' })
    @ApiParam({ name: 'id', description: 'UUID' })
    @ApiResponse({ status: 200 })
    async getById(@Param('id') id: string) {
        const data = await this.service.getById(id);
        return ResponseBuilder.success(data);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật đơn vị tính' })
    @ApiParam({ name: 'id', description: 'UUID' })
    @ApiResponse({ status: 200 })
    async update(@Param('id') id: string, @Body() dto: UpdateUnitOfMeasureDto) {
        await this.service.update(id, dto);
        return ResponseBuilder.success({ message: 'Updated' });
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa đơn vị tính' })
    @ApiParam({ name: 'id', description: 'UUID' })
    @ApiResponse({ status: 200 })
    async delete(@Param('id') id: string) {
        await this.service.delete(id);
        return ResponseBuilder.success({ message: 'Deleted' });
    }
}


