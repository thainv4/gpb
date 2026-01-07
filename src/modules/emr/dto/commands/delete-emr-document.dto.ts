import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class DeleteEmrDocumentDto {
    @ApiProperty({
        description: 'Document ID từ bảng BML_STORED_SR_SERVICES (DOCUMENT_ID)',
        example: 56397687
    })
    @IsNumber()
    @IsNotEmpty()
    documentId: number;
}

