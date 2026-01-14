import { ApiProperty } from '@nestjs/swagger';
import { StainingMethodResponseDto } from './staining-method-response.dto';

export class StainingMethodsListResponseDto {
    @ApiProperty({ description: 'Danh sách phương pháp nhuộm', type: [StainingMethodResponseDto] })
    stainingMethods: StainingMethodResponseDto[];

    @ApiProperty({ description: 'Tổng số bản ghi' })
    total: number;

    @ApiProperty({ description: 'Số lượng mỗi trang' })
    limit: number;

    @ApiProperty({ description: 'Vị trí bắt đầu' })
    offset: number;
}
