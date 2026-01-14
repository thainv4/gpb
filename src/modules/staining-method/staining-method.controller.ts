import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StainingMethodService } from './staining-method.service';
import { CreateStainingMethodDto } from './dto/commands/create-staining-method.dto';
import { UpdateStainingMethodDto } from './dto/commands/update-staining-method.dto';
import { GetStainingMethodsDto } from './dto/queries/get-staining-methods.dto';
import { StainingMethodResponseDto } from './dto/responses/staining-method-response.dto';
import { StainingMethodsListResponseDto } from './dto/responses/staining-methods-list-response.dto';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser as ICurrentUser } from '../../common/interfaces/current-user.interface';

@ApiTags('Staining Methods')
@Controller('staining-methods')
@UseGuards(DualAuthGuard)
@ApiBearerAuth('JWT-auth')
export class StainingMethodController {
    constructor(private readonly stainingMethodService: StainingMethodService) { }

    @Post()
    @ApiOperation({ summary: 'Tạo phương pháp nhuộm', description: 'Tạo mới một phương pháp nhuộm' })
    @ApiBody({ type: CreateStainingMethodDto })
    @ApiResponse({ status: 201, description: 'Tạo thành công', type: StainingMethodResponseDto })
    @ApiResponse({ status: 409, description: 'Phương pháp nhuộm đã tồn tại' })
    async create(
        @Body() createDto: CreateStainingMethodDto,
        @CurrentUser() currentUser: ICurrentUser,
    ) {
        const id = await this.stainingMethodService.create(createDto, currentUser);
        return ResponseBuilder.success({ id }, HttpStatus.CREATED);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật phương pháp nhuộm', description: 'Cập nhật thông tin phương pháp nhuộm' })
    @ApiParam({ name: 'id', description: 'ID phương pháp nhuộm' })
    @ApiBody({ type: UpdateStainingMethodDto })
    @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy phương pháp nhuộm' })
    @ApiResponse({ status: 409, description: 'Phương pháp nhuộm đã tồn tại' })
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateStainingMethodDto,
        @CurrentUser() currentUser: ICurrentUser,
    ) {
        await this.stainingMethodService.update(id, updateDto, currentUser);
        return ResponseBuilder.success({ message: 'Staining method updated successfully' });
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa phương pháp nhuộm', description: 'Xóa mềm phương pháp nhuộm' })
    @ApiParam({ name: 'id', description: 'ID phương pháp nhuộm' })
    @ApiResponse({ status: 200, description: 'Xóa thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy phương pháp nhuộm' })
    async delete(@Param('id') id: string) {
        await this.stainingMethodService.delete(id);
        return ResponseBuilder.success({ message: 'Staining method deleted successfully' });
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách phương pháp nhuộm', description: 'Phân trang và tìm kiếm theo tên' })
    @ApiQuery({ name: 'limit', required: false, description: 'Số lượng bản ghi' })
    @ApiQuery({ name: 'offset', required: false, description: 'Vị trí bắt đầu' })
    @ApiQuery({ name: 'search', required: false, description: 'Từ khóa tìm kiếm' })
    @ApiResponse({ status: 200, description: 'Danh sách phương pháp nhuộm', type: StainingMethodsListResponseDto })
    async getList(@Query() query: GetStainingMethodsDto) {
        const result = await this.stainingMethodService.getList(query);
        return ResponseBuilder.success(result);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết phương pháp nhuộm', description: 'Lấy thông tin phương pháp nhuộm theo ID' })
    @ApiParam({ name: 'id', description: 'ID phương pháp nhuộm' })
    @ApiResponse({ status: 200, description: 'Thông tin phương pháp nhuộm', type: StainingMethodResponseDto })
    @ApiResponse({ status: 404, description: 'Không tìm thấy phương pháp nhuộm' })
    async getById(@Param('id') id: string) {
        const stainingMethod = await this.stainingMethodService.getById(id);
        return ResponseBuilder.success(stainingMethod);
    }
}
