import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';

export class UpdateDocumentIdDto {
    @ApiPropertyOptional({ 
        description: 'ID văn bản EMR (từ bảng EMR_DOCUMENT). Có thể null để hủy chữ ký số.', 
        example: 123,
        nullable: true
    })
    @IsOptional()
    @IsNumber()
    documentId?: number | null;
}

