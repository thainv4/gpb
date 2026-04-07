import { ApiProperty } from '@nestjs/swagger';

export class DashboardCaseVolumePointDto {
    @ApiProperty({
        description:
            'Nhãn kỳ: ngày YYYY-MM-DD, tuần ISO dạng IYYY-IW, hoặc tháng YYYY-MM (theo TO_CHAR Oracle)',
        example: '2026-04-07',
    })
    period: string;

    @ApiProperty({ description: 'Số stored service request tạo trong kỳ (theo CREATED_AT)' })
    count: number;
}

export class DashboardCaseVolumeResponseDto {
    @ApiProperty({ enum: ['day', 'week', 'month'] })
    granularity: 'day' | 'week' | 'month';

    @ApiProperty()
    fromDate: string;

    @ApiProperty()
    toDate: string;

    @ApiProperty({ type: [DashboardCaseVolumePointDto] })
    series: DashboardCaseVolumePointDto[];

    @ApiProperty({ description: 'Tổng count trên toàn chuỗi (bằng tổng series.count)' })
    total: number;
}
