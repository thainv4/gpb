import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SampleTypeResponseDto {
    @ApiProperty({ description: 'ID loại mẫu' })
    id: string;

    @ApiProperty({ description: 'Mã loại mẫu' })
    typeCode: string;

    @ApiProperty({ description: 'Tên loại mẫu' })
    typeName: string;

    @ApiPropertyOptional({ description: 'Tên viết tắt' })
    shortName?: string;

    @ApiPropertyOptional({ description: 'Mô tả' })
    description?: string;

    @ApiProperty({ description: 'Số thứ tự' })
    sortOrder: number;

    @ApiProperty({ description: 'Tiền tố mã tiếp nhận' })
    codePrefix: string;

    @ApiProperty({ description: 'Độ rộng phần số' })
    codeWidth: number;

    @ApiProperty({ description: 'Cho phép mã trùng lặp' })
    allowDuplicate: boolean;

    @ApiProperty({ description: 'Chu kỳ reset số thứ tự' })
    resetPeriod: string;

    @ApiProperty({ description: 'Tên hiển thị' })
    displayName: string;

    @ApiProperty({ description: 'Thông tin sinh mã' })
    codeGenerationInfo: string;

    @ApiProperty({ description: 'Ngày tạo' })
    createdAt: Date;

    @ApiProperty({ description: 'Ngày cập nhật' })
    updatedAt: Date;

    @ApiProperty({ description: 'Người tạo' })
    createdBy: string;

    @ApiProperty({ description: 'Người cập nhật' })
    updatedBy: string;

    @ApiProperty({ description: 'Phiên bản' })
    version: number;
}
