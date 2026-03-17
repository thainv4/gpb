import { ApiProperty } from '@nestjs/swagger';
import { DeviceOutboundResponseDto } from './device-outbound-response.dto';

export class DeviceOutboundListResponseDto {
    @ApiProperty({ description: 'Danh sách bản ghi', type: [DeviceOutboundResponseDto] })
    items: DeviceOutboundResponseDto[];

    @ApiProperty({ description: 'Phân trang' })
    pagination: {
        total: number;
        limit: number;
        offset: number;
        has_next: boolean;
        has_prev: boolean;
    };
}

export interface GetDeviceOutboundListResult {
    items: DeviceOutboundResponseDto[];
    total: number;
    limit: number;
    offset: number;
}
