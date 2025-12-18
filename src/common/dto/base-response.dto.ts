import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto {
    @ApiProperty({ description: 'ID của bản ghi' })
    id: string;

    @ApiProperty({ description: 'Thời gian tạo' })
    createdAt: Date;

    @ApiProperty({ description: 'Thời gian cập nhật' })
    updatedAt: Date;

    @ApiProperty({ description: 'Thời gian xóa (soft delete)', required: false })
    deletedAt?: Date;

    @ApiProperty({ description: 'Người tạo' })
    createdBy: string;

    @ApiProperty({ description: 'Người cập nhật' })
    updatedBy: string;

    @ApiProperty({ description: 'Phiên bản' })
    version: number;
}
