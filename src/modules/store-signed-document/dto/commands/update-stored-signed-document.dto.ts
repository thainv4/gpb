import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateStoredSignedDocumentDto {
    @ApiPropertyOptional({ description: 'ID của StoredServiceRequest', example: 'f32c11f9-cab8-4f72-9776-5b41a1bc89e8' })
    @IsOptional()
    @IsString()
    @MaxLength(36)
    storedServiceReqId?: string;

    @ApiPropertyOptional({ description: 'Mã yêu cầu dịch vụ HIS', example: '000055537395' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    hisServiceReqCode?: string;

    @ApiPropertyOptional({ description: 'ID văn bản EMR (từ bảng EMR_DOCUMENT)' })
    @IsOptional()
    @IsNumber()
    documentId?: number | null;

    @ApiPropertyOptional({ description: 'Văn bản đã ký dạng base64' })
    @IsOptional()
    @IsString()
    signedDocumentBase64?: string | null;
}
