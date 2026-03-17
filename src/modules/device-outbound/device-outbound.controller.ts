import {
    Controller,
    Post,
    Get,
    Put,
    Delete,
    Body,
    Query,
    Param,
    UseGuards,
    BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { DeviceOutboundService } from './device-outbound.service';
import { CreateDeviceOutboundDto } from './dto/commands/create-device-outbound.dto';
import { UpdateDeviceOutboundDto } from './dto/commands/update-device-outbound.dto';
import { GetDeviceOutboundListDto } from './dto/queries/get-device-outbound-list.dto';
import { DeviceOutboundResponseDto } from './dto/responses/device-outbound-response.dto';
import { DeviceOutboundServiceItemDto } from './dto/responses/device-outbound-service-item.dto';
import { DeviceOutboundListResponseDto } from './dto/responses/device-outbound-list-response.dto';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser as ICurrentUser } from '../../common/interfaces/current-user.interface';
import { HttpStatus } from '@nestjs/common';

@ApiTags('device-outbound')
@ApiBearerAuth('JWT-auth')
@UseGuards(DualAuthGuard)
@Controller('device-outbound')
export class DeviceOutboundController {
    constructor(private readonly deviceOutboundService: DeviceOutboundService) {}

    @Post()
    @ApiOperation({
        summary: 'Tạo bản ghi xuất thiết bị',
        description:
            'Lưu bản ghi Device Outbound. Block_ID = receptionCode + "A." + blockNumber, Slide_id = receptionCode + "A." + blockNumber + "." + slideNumber.',
    })
    @ApiResponse({ status: 201, description: 'Tạo thành công', type: DeviceOutboundResponseDto })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    async create(
        @Body() dto: CreateDeviceOutboundDto,
        @CurrentUser() currentUser: ICurrentUser | null,
    ) {
        if (!currentUser) {
            throw new BadRequestException(
                'JWT authentication required for device outbound. HIS token is not supported for write operations.',
            );
        }
        const result = await this.deviceOutboundService.create(dto, currentUser);
        return ResponseBuilder.success(result, HttpStatus.CREATED);
    }

    @Get()
    @ApiOperation({ summary: 'Danh sách bản ghi xuất thiết bị', description: 'Phân trang, lọc theo receptionCode, serviceCode' })
    @ApiResponse({ status: 200, description: 'Danh sách kèm phân trang', type: DeviceOutboundListResponseDto })
    async getList(@Query() query: GetDeviceOutboundListDto) {
        const result = await this.deviceOutboundService.getList(query);
        const data = {
            items: result.items,
            pagination: {
                total: result.total,
                limit: result.limit,
                offset: result.offset,
                has_next: result.offset + result.limit < result.total,
                has_prev: result.offset > 0,
            },
        };
        return ResponseBuilder.success(data);
    }

    @Get('services')
    @ApiOperation({
        summary: 'Danh sách dịch vụ theo mã tiếp nhận',
        description: 'Lấy danh sách dịch vụ (từ BML_STORED_SR_SERVICES) theo receptionCode, dùng cho dropdown chọn dịch vụ.',
    })
    @ApiQuery({ name: 'receptionCode', required: true, type: String, example: 'S2601.0312' })
    @ApiResponse({ status: 200, description: 'Danh sách dịch vụ', type: [DeviceOutboundServiceItemDto] })
    async getServicesByReceptionCode(@Query('receptionCode') receptionCode: string) {
        if (!receptionCode?.trim()) {
            throw new BadRequestException('receptionCode is required');
        }
        const items = await this.deviceOutboundService.getServicesByReceptionCode(receptionCode.trim());
        return ResponseBuilder.success(items);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Chi tiết một bản ghi theo ID' })
    @ApiParam({ name: 'id', description: 'ID bản ghi' })
    @ApiResponse({ status: 200, description: 'Chi tiết bản ghi', type: DeviceOutboundResponseDto })
    @ApiResponse({ status: 404, description: 'Không tìm thấy' })
    async getById(@Param('id') id: string) {
        const result = await this.deviceOutboundService.getById(id);
        return ResponseBuilder.success(result);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật bản ghi xuất thiết bị', description: 'Nếu đổi receptionCode/blockNumber/slideNumber thì Block_ID và Slide_id được tính lại' })
    @ApiParam({ name: 'id', description: 'ID bản ghi' })
    @ApiResponse({ status: 200, description: 'Cập nhật thành công', type: DeviceOutboundResponseDto })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy' })
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateDeviceOutboundDto,
        @CurrentUser() currentUser: ICurrentUser | null,
    ) {
        if (!currentUser) {
            throw new BadRequestException(
                'JWT authentication required for device outbound. HIS token is not supported for write operations.',
            );
        }
        const result = await this.deviceOutboundService.update(id, dto, currentUser);
        return ResponseBuilder.success(result);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa mềm bản ghi xuất thiết bị' })
    @ApiParam({ name: 'id', description: 'ID bản ghi' })
    @ApiResponse({ status: 200, description: 'Xóa thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy' })
    async delete(@Param('id') id: string) {
        await this.deviceOutboundService.delete(id);
        return ResponseBuilder.success({ message: 'Device outbound deleted successfully' });
    }
}
