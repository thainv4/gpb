import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SampleReceptionResponseDto {
    @ApiProperty({ description: 'ID tiếp nhận' })
    id: string;

    @ApiProperty({ description: 'Mã tiếp nhận' })
    receptionCode: string;

    @ApiProperty({ description: 'Mã loại mẫu' })
    sampleTypeCode: string;

    @ApiProperty({ description: 'Tên loại mẫu' })
    sampleTypeName: string;

    @ApiProperty({ description: 'Ngày tiếp nhận' })
    receptionDate: Date;

    @ApiProperty({ description: 'Số thứ tự' })
    sequenceNumber: number;

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
