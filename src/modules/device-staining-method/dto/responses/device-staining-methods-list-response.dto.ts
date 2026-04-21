import { ApiProperty } from '@nestjs/swagger';
import { DeviceStainingMethodResponseDto } from './device-staining-method-response.dto';

export class DeviceStainingMethodsListResponseDto {
    @ApiProperty({ description: 'Danh sách phương pháp nhuộm (thiết bị)', type: [DeviceStainingMethodResponseDto] })
    deviceStainingMethods: DeviceStainingMethodResponseDto[];

    @ApiProperty({ description: 'Tổng số bản ghi' })
    total: number;

    @ApiProperty({ description: 'Số lượng mỗi trang' })
    limit: number;

    @ApiProperty({ description: 'Vị trí bắt đầu' })
    offset: number;
}
