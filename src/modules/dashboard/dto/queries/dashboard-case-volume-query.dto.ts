import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class DashboardCaseVolumeQueryDto {
    @ApiPropertyOptional({
        description: 'Gom nhóm theo ngày (YYYY-MM-DD), tuần ISO (IYYY-IW), hoặc tháng (YYYY-MM)',
        enum: ['day', 'week', 'month'],
        example: 'day',
        default: 'day',
    })
    @IsOptional()
    @IsEnum(['day', 'week', 'month'])
    granularity?: 'day' | 'week' | 'month' = 'day';

    @ApiPropertyOptional({
        description:
            'CREATED_AT từ (ISO). Mặc định: 30 ngày trước `toDate` hoặc trước hiện tại nếu không có toDate.',
        example: '2026-03-01T00:00:00.000Z',
    })
    @IsOptional()
    @IsDateString()
    fromDate?: string;

    @ApiPropertyOptional({
        description: 'CREATED_AT đến (ISO). Mặc định: thời điểm gọi API.',
        example: '2026-04-07T23:59:59.999Z',
    })
    @IsOptional()
    @IsDateString()
    toDate?: string;

    @ApiPropertyOptional({
        description: 'Lọc theo phòng hiện tại (LIS room id), giống trend SR',
    })
    @IsOptional()
    @IsString()
    @Type(() => String)
    currentRoomId?: string;

    @ApiPropertyOptional({
        description: 'Lọc theo khoa hiện tại (LIS department id), giống trend SR',
    })
    @IsOptional()
    @IsString()
    @Type(() => String)
    currentDepartmentId?: string;
}
