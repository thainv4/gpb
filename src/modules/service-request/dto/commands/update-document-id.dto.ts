import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateDocumentIdDto {
    @ApiProperty({ 
        description: 'ID văn bản EMR (từ bảng EMR_DOCUMENT)', 
        example: 123 
    })
    @IsNotEmpty()
    @IsNumber()
    documentId: number;
}

