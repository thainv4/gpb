import { ApiProperty } from '@nestjs/swagger';

export class ResultTemplateResponseDto {
    @ApiProperty({
        description: 'ID của mẫu kết quả',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    id: string;

    @ApiProperty({
        description: 'Tên mẫu kết quả',
        example: 'Mẫu xét nghiệm máu'
    })
    templateName: string;

    @ApiProperty({
        description: 'Mẫu văn bản kết quả xét nghiệm',
        example: 'Kết quả xét nghiệm tổng quát: {{param1}}, {{param2}}'
    })
    resultTextTemplate: string;

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

