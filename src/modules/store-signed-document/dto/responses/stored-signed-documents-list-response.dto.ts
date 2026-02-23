import { ApiProperty } from '@nestjs/swagger';
import { StoredSignedDocumentResponseDto } from './stored-signed-document-response.dto';

export class StoredSignedDocumentsListResponseDto {
    @ApiProperty({ description: 'Danh sách', type: [StoredSignedDocumentResponseDto] })
    items: StoredSignedDocumentResponseDto[];

    @ApiProperty({ description: 'Tổng số bản ghi' })
    total: number;

    @ApiProperty({ description: 'Số lượng mỗi trang' })
    limit: number;

    @ApiProperty({ description: 'Vị trí bắt đầu' })
    offset: number;
}
