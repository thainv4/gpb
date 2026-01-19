import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResultTemplateResponseDto {
    @ApiProperty({
        description: 'ID của mẫu kết quả',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    id: string;

    @ApiProperty({
        description: 'Mã mẫu kết quả',
        example: 'RT001'
    })
    resultTemplateCode: string;

    @ApiProperty({
        description: 'Tên mẫu kết quả',
        example: 'Mẫu xét nghiệm máu'
    })
    templateName: string;

    @ApiPropertyOptional({
        description: 'Mô tả kết quả',
        example: 'Mô tả chi tiết về kết quả xét nghiệm',
        nullable: true
    })
    resultDescription?: string | null;

    @ApiPropertyOptional({
        description: 'Kết luận',
        example: 'Kết luận về kết quả xét nghiệm',
        nullable: true
    })
    resultConclude?: string | null;

    @ApiPropertyOptional({
        description: 'Ghi chú kết quả',
        example: 'Ghi chú về kết quả xét nghiệm',
        nullable: true
    })
    resultNote?: string | null;

    @ApiProperty({
        description: 'Ngày tạo',
        example: '2025-12-09T10:00:00.000Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Ngày cập nhật',
        example: '2025-12-09T10:00:00.000Z'
    })
    updatedAt: Date;

    @ApiProperty({
        description: 'Người tạo',
        example: 'user123',
        nullable: true
    })
    createdBy?: string;

    @ApiProperty({
        description: 'Người cập nhật',
        example: 'user123',
        nullable: true
    })
    updatedBy?: string;
}

