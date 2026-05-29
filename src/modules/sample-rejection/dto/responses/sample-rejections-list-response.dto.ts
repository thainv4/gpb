import { ApiProperty } from '@nestjs/swagger';
import { SampleRejectionResponseDto } from './sample-rejection-response.dto';

export class SampleRejectionsListResponseDto {
    @ApiProperty({ description: 'Danh sách từ chối bệnh phẩm', type: [SampleRejectionResponseDto] })
    sampleRejections: SampleRejectionResponseDto[];

    @ApiProperty({ description: 'Tổng số bản ghi' })
    total: number;

    @ApiProperty({ description: 'Số lượng mỗi trang' })
    limit: number;

    @ApiProperty({ description: 'Vị trí bắt đầu' })
    offset: number;
}
