import { ApiProperty } from '@nestjs/swagger';
import { SampleReceptionResponseDto } from './sample-reception-response.dto';

export class SampleReceptionsListResponseDto {
    @ApiProperty({ type: [SampleReceptionResponseDto], description: 'Danh sách tiếp nhận mẫu' })
    receptions: SampleReceptionResponseDto[];

    @ApiProperty({ description: 'Tổng số bản ghi' })
    total: number;

    @ApiProperty({ description: 'Giới hạn bản ghi trên mỗi trang' })
    limit: number;

    @ApiProperty({ description: 'Số lượng bản ghi đã bỏ qua' })
    offset: number;
}
