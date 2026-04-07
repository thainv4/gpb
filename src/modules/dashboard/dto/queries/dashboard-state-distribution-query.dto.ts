import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class DashboardStateDistributionQueryDto {
    @ApiPropertyOptional({
        description:
            'Lọc chỉ các stored service request có CREATED_AT >= mốc này (ISO 8601). Bỏ trống = không lọc đầu khoảng.',
        example: '2026-04-01T00:00:00.456Z',
    })
    @IsOptional()
    @IsDateString()
    fromDate?: string;

    @ApiPropertyOptional({
        description:
            'Lọc chỉ các stored service request có CREATED_AT <= mốc này (ISO 8601). Bỏ trống = không lọc cuối khoảng.',
        example: '2026-04-30T23:59:59.999Z',
    })
    @IsOptional()
    @IsDateString()
    toDate?: string;

    @ApiPropertyOptional({
        description: 'Lọc theo phòng hiện tại khi lưu chỉ định (LIS room id = CURRENT_ROOM_ID)',
        example: 'a3c4f3b7-1234-4f19-8d62-123456789abc',
    })
    @IsOptional()
    @IsString()
    @Type(() => String)
    currentRoomId?: string;

    @ApiPropertyOptional({
        description: 'Lọc theo khoa hiện tại khi lưu chỉ định (LIS department id = CURRENT_DEPARTMENT_ID)',
        example: 'b2f1d7a1-2345-48f1-90e2-abcdef123456',
    })
    @IsOptional()
    @IsString()
    @Type(() => String)
    currentDepartmentId?: string;
}
