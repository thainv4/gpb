import { ApiProperty } from '@nestjs/swagger';

export class StoredServiceRequestTrendItemDto {
    @ApiProperty({
        description: 'Mốc thời gian đã group (YYYY-MM-DD, YYYY-MM, hoặc tuần ISO IYYY-IW)',
        example: '2026-03-24',
    })
    period: string;

    @ApiProperty({ description: 'Số lượng chỉ định', example: 42 })
    count: number;
}

export class StoredServiceRequestTrendResponseDto {
    @ApiProperty({ description: 'Độ phân giải thống kê', enum: ['day', 'week', 'month'], example: 'day' })
    granularity: 'day' | 'week' | 'month';

    @ApiProperty({ description: 'Danh sách điểm thống kê', type: [StoredServiceRequestTrendItemDto] })
    items: StoredServiceRequestTrendItemDto[];
}
