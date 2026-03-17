import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Một dịch vụ trong danh sách theo receptionCode (từ BML_STORED_SR_SERVICES), dùng cho dropdown chọn dịch vụ.
 */
export class DeviceOutboundServiceItemDto {
    @ApiProperty({ description: 'ID bản ghi StoredServiceRequestService' })
    id: string;

    @ApiPropertyOptional({ description: 'Mã dịch vụ' })
    serviceCode?: string | null;

    @ApiPropertyOptional({ description: 'Tên dịch vụ' })
    serviceName?: string | null;

    @ApiProperty({ description: '0 = parent, 1 = child' })
    isChildService: number;

    @ApiPropertyOptional({ description: 'ID service cha (nếu là child)' })
    parentServiceId?: string | null;
}
