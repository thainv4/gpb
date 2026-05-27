import {
    Controller,
    Post,
    Get,
    Body,
    Query,
    UseGuards,
    BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DeviceOutboundService } from './device-outbound.service';
import { CreateDeviceOutboundDto } from './dto/commands/create-device-outbound.dto';
import { BatchCreateDeviceOutboundDto } from './dto/commands/batch-create-device-outbound.dto';
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
        summary: 'Gửi order (HL7 out queue)',
        description:
            'Insert một dòng vào BML_HL7_OUT_QUEUE. Block/Slide ID được tính từ receptionCode và số block/slide.',
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

    @Post('batch')
    @ApiOperation({
        summary: 'Gửi nhiều order (batch HL7 out queue)',
        description:
            'Insert nhiều dòng BML_HL7_OUT_QUEUE trong một transaction. Rollback toàn bộ nếu một dòng lỗi.',
    })
    @ApiResponse({ status: 201, description: 'Tạo thành công', type: [DeviceOutboundResponseDto] })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    async createBatch(
        @Body() dto: BatchCreateDeviceOutboundDto,
        @CurrentUser() currentUser: ICurrentUser | null,
    ) {
        if (!currentUser) {
            throw new BadRequestException(
                'JWT authentication required for device outbound. HIS token is not supported for write operations.',
            );
        }
        const result = await this.deviceOutboundService.createBatch(dto, currentUser);
        return ResponseBuilder.success(result, HttpStatus.CREATED);
    }

    @Get()
    @ApiOperation({
        summary: 'Danh sách hàng đợi HL7',
        description: 'Phân trang, lọc theo receptionCode (LIS_CASE_ID)',
    })
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
}
