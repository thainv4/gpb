import { ApiProperty } from '@nestjs/swagger';
import { SampleTypeResponseDto } from './sample-type-response.dto';

export class SampleTypesListResponseDto {
    @ApiProperty({ description: 'Danh sách loại mẫu', type: [SampleTypeResponseDto] })
    sampleTypes: SampleTypeResponseDto[];

    @ApiProperty({ description: 'Tổng số bản ghi' })
    total: number;

    @ApiProperty({ description: 'Số lượng bản ghi trên trang' })
    limit: number;

    @ApiProperty({ description: 'Vị trí bắt đầu' })
    offset: number;
}
