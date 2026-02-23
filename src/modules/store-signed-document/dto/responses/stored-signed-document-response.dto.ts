import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StoredSignedDocumentResponseDto {
    @ApiProperty({ description: 'ID' })
    id: string;

    @ApiProperty({ description: 'ID StoredServiceRequest' })
    storedServiceReqId: string;

    @ApiProperty({ description: 'Mã yêu cầu dịch vụ HIS' })
    hisServiceReqCode: string;

    @ApiPropertyOptional({ description: 'ID văn bản EMR', nullable: true })
    documentId?: number | null;

    @ApiPropertyOptional({ description: 'Văn bản đã ký base64 (có thể null nếu exclude)', nullable: true })
    signedDocumentBase64?: string | null;

    @ApiProperty({ description: 'Ngày tạo' })
    createdAt: Date;

    @ApiProperty({ description: 'Ngày cập nhật' })
    updatedAt: Date;

    @ApiPropertyOptional({ description: 'Người tạo', nullable: true })
    createdBy?: string | null;

    @ApiPropertyOptional({ description: 'Người cập nhật', nullable: true })
    updatedBy?: string | null;

    @ApiProperty({ description: 'Phiên bản' })
    version: number;
}
