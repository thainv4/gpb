import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StoredServiceResultResponseDto {
    @ApiProperty({ description: 'ID kết quả', example: 'abc-123-def-456' })
    id: string;

    @ApiProperty({ description: 'ID dịch vụ', example: 'xyz-789-uvw-012' })
    storedSrServiceId: string;

    @ApiPropertyOptional({ description: 'ID văn bản EMR', example: 12345 })
    documentId?: number;

    @ApiPropertyOptional({ description: 'Mô tả kết quả' })
    description?: string;

    @ApiPropertyOptional({ description: 'Kết luận' })
    conclude?: string;

    @ApiPropertyOptional({ description: 'Ghi chú' })
    note?: string;

    @ApiProperty({ description: 'Ngày tạo', example: '2026-01-13T10:30:00Z' })
    createdAt: Date;

    @ApiProperty({ description: 'Ngày cập nhật', example: '2026-01-13T10:30:00Z' })
    updatedAt: Date;

    @ApiPropertyOptional({ description: 'Người tạo', example: 'admin' })
    createdBy?: string;

    @ApiPropertyOptional({ description: 'Người cập nhật', example: 'admin' })
    updatedBy?: string;

    @ApiProperty({ description: 'Phiên bản', example: 1 })
    version: number;
}
