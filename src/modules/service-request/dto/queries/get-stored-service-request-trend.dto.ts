import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class GetStoredServiceRequestTrendDto {
    @ApiPropertyOptional({
        description: 'Độ phân giải thống kê (tuần: định dạng ISO IYYY-IW theo Oracle TO_CHAR)',
        enum: ['day', 'week', 'month'],
        example: 'day',
        default: 'day',
    })
    @IsOptional()
    @IsEnum(['day', 'week', 'month'])
    granularity?: 'day' | 'week' | 'month' = 'day';

    @ApiPropertyOptional({
        description: 'Thời gian bắt đầu (ISO date string)',
        example: '2026-03-01T00:00:00.000Z',
    })
    @IsOptional()
    @IsDateString()
    fromDate?: string;

    @ApiPropertyOptional({
        description: 'Thời gian kết thúc (ISO date string)',
        example: '2026-03-31T23:59:59.999Z',
    })
    @IsOptional()
    @IsDateString()
    toDate?: string;

    @ApiPropertyOptional({
        description: 'Lọc theo phòng hiện tại khi lưu chỉ định (LIS room id)',
        example: 'a3c4f3b7-1234-4f19-8d62-123456789abc',
    })
    @IsOptional()
    @IsString()
    @Type(() => String)
    currentRoomId?: string;

    @ApiPropertyOptional({
        description: 'Lọc theo khoa hiện tại khi lưu chỉ định (LIS department id)',
        example: 'b2f1d7a1-2345-48f1-90e2-abcdef123456',
    })
    @IsOptional()
    @IsString()
    @Type(() => String)
    currentDepartmentId?: string;
}
