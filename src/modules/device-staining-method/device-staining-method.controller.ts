import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeviceStainingMethodService } from './device-staining-method.service';
import { CreateDeviceStainingMethodDto } from './dto/commands/create-device-staining-method.dto';
import { UpdateDeviceStainingMethodDto } from './dto/commands/update-device-staining-method.dto';
import { GetDeviceStainingMethodsDto } from './dto/queries/get-device-staining-methods.dto';
import { DeviceStainingMethodResponseDto } from './dto/responses/device-staining-method-response.dto';
import { DeviceStainingMethodsListResponseDto } from './dto/responses/device-staining-methods-list-response.dto';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser as ICurrentUser } from '../../common/interfaces/current-user.interface';

@ApiTags('Device Staining Methods')
@Controller('device-staining-methods')
@UseGuards(DualAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DeviceStainingMethodController {
    constructor(private readonly deviceStainingMethodService: DeviceStainingMethodService) { }

    @Post()
    @ApiOperation({ summary: 'Tạo phương pháp nhuộm thiết bị', description: 'Tạo mới một phương pháp nhuộm dùng cho thiết bị' })
    @ApiBody({ type: CreateDeviceStainingMethodDto })
    @ApiResponse({ status: 201, description: 'Tạo thành công', type: DeviceStainingMethodResponseDto })
    @ApiResponse({ status: 409, description: 'Phương pháp đã tồn tại' })
    async create(
        @Body() createDto: CreateDeviceStainingMethodDto,
        @CurrentUser() currentUser: ICurrentUser,
    ) {
        const id = await this.deviceStainingMethodService.create(createDto, currentUser);
        return ResponseBuilder.success({ id }, HttpStatus.CREATED);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật phương pháp nhuộm thiết bị', description: 'Cập nhật thông tin phương pháp nhuộm thiết bị' })
    @ApiParam({ name: 'id', description: 'ID bản ghi (BML_DEVICE_STAINING_METHOD.ID)' })
    @ApiBody({ type: UpdateDeviceStainingMethodDto })
    @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy' })
    @ApiResponse({ status: 409, description: 'Tên đã tồn tại' })
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateDeviceStainingMethodDto,
        @CurrentUser() currentUser: ICurrentUser,
    ) {
        await this.deviceStainingMethodService.update(id, updateDto, currentUser);
        return ResponseBuilder.success({ message: 'Device staining method updated successfully' });
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa phương pháp nhuộm thiết bị', description: 'Xóa mềm bản ghi' })
    @ApiParam({ name: 'id', description: 'ID bản ghi' })
    @ApiResponse({ status: 200, description: 'Xóa thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy' })
    async delete(@Param('id') id: string) {
        await this.deviceStainingMethodService.delete(id);
        return ResponseBuilder.success({ message: 'Device staining method deleted successfully' });
    }

    @Get()
    @ApiOperation({ summary: 'Danh sách phương pháp nhuộm thiết bị', description: 'Phân trang và tìm kiếm theo tên' })
    @ApiQuery({ name: 'limit', required: false, description: 'Số lượng bản ghi' })
    @ApiQuery({ name: 'offset', required: false, description: 'Vị trí bắt đầu' })
    @ApiQuery({ name: 'search', required: false, description: 'Từ khóa tìm kiếm' })
    @ApiResponse({ status: 200, description: 'Danh sách', type: DeviceStainingMethodsListResponseDto })
    async getList(@Query() query: GetDeviceStainingMethodsDto) {
        const result = await this.deviceStainingMethodService.getList(query);
        return ResponseBuilder.success(result);
    }

    @Get('search/method-name')
    @ApiOperation({ summary: 'Tìm theo tên phương pháp', description: 'Khớp chính xác methodName' })
    @ApiQuery({ name: 'methodName', required: true, description: 'Tên phương pháp nhuộm', example: 'H&E' })
    @ApiResponse({ status: 200, description: 'Chi tiết', type: DeviceStainingMethodResponseDto })
    @ApiResponse({ status: 404, description: 'Không tìm thấy' })
    async getByMethodName(@Query('methodName') methodName: string) {
        const item = await this.deviceStainingMethodService.getByMethodName(methodName);
        return ResponseBuilder.success(item);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Chi tiết phương pháp nhuộm thiết bị', description: 'Theo ID' })
    @ApiParam({ name: 'id', description: 'ID bản ghi' })
    @ApiResponse({ status: 200, description: 'Chi tiết', type: DeviceStainingMethodResponseDto })
    @ApiResponse({ status: 404, description: 'Không tìm thấy' })
    async getById(@Param('id') id: string) {
        const item = await this.deviceStainingMethodService.getById(id);
        return ResponseBuilder.success(item);
    }
}
