import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ServiceGroupResponseDto {
    @ApiProperty({ description: 'ID của nhóm dịch vụ' })
    id: string;

    @ApiProperty({ description: 'Mã nhóm dịch vụ' })
    serviceGroupCode: string;

    @ApiProperty({ description: 'Tên nhóm dịch vụ' })
    serviceGroupName: string;

    @ApiPropertyOptional({ description: 'Tên viết tắt' })
    shortName?: string;

    @ApiPropertyOptional({ description: 'Mapping với hệ thống khác' })
    mapping?: string;

    @ApiPropertyOptional({ description: 'Mô tả chi tiết' })
    description?: string;

    @ApiProperty({ description: 'Trạng thái hoạt động' })
    isActive: boolean;

    @ApiProperty({ description: 'Thứ tự sắp xếp' })
    sortOrder: number;

    @ApiPropertyOptional({ description: 'Icon cho UI' })
    icon?: string;

    @ApiPropertyOptional({ description: 'Màu sắc cho UI' })
    color?: string;

    @ApiProperty({ description: 'Tên hiển thị' })
    displayName: string;

    @ApiProperty({ description: 'Tên hiển thị ngắn' })
    shortDisplayName: string;

    @ApiProperty({ description: 'Ngày tạo' })
    createdAt: Date;

    @ApiProperty({ description: 'Ngày cập nhật' })
    updatedAt: Date;

    @ApiPropertyOptional({ description: 'Người tạo' })
    createdBy?: string;

    @ApiPropertyOptional({ description: 'Người cập nhật' })
    updatedBy?: string;

    @ApiProperty({ description: 'Phiên bản' })
    version: number;
}
