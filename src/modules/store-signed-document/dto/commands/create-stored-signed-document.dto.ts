import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateStoredSignedDocumentDto {
    @ApiProperty({ description: 'ID của StoredServiceRequest (BML_STORED_SERVICE_REQUESTS.ID)', example: 'f32c11f9-cab8-4f72-9776-5b41a1bc89e8' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(36)
    storedServiceReqId: string;

    @ApiProperty({ description: 'Mã yêu cầu dịch vụ HIS (SERVICE_REQ_CODE)', example: '000055537395' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    hisServiceReqCode: string;

    @ApiProperty({ description: 'ID văn bản EMR (từ bảng EMR_DOCUMENT)', required: false })
    @IsOptional()
    @IsNumber()
    documentId?: number | null;

    @ApiProperty({ description: 'Văn bản đã ký dạng base64', required: false })
    @IsOptional()
    @IsString()
    signedDocumentBase64?: string | null;
}
