import { ApiProperty } from '@nestjs/swagger';

export class TestingMethodGenResponseDto {
    @ApiProperty({ description: 'ID phương pháp xét nghiệm' })
    id: string;

    @ApiProperty({ description: 'Tên phương pháp xét nghiệm' })
    methodName: string;

    @ApiProperty({ description: 'Ngày tạo' })
    createdAt: Date;

    @ApiProperty({ description: 'Ngày cập nhật' })
    updatedAt: Date;

    @ApiProperty({ description: 'Người tạo', nullable: true })
    createdBy?: string | null;

    @ApiProperty({ description: 'Người cập nhật', nullable: true })
    updatedBy?: string | null;

    @ApiProperty({ description: 'Phiên bản' })
    version: number;
}
