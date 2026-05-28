import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsInt, IsISO8601, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetAuditLogsDto {
    @ApiPropertyOptional({ description: 'Từ ngày (ISO 8601)' })
    @IsOptional()
    @IsISO8601()
    fromDate?: string;

    @ApiPropertyOptional({ description: 'Đến ngày (ISO 8601)' })
    @IsOptional()
    @IsISO8601()
    toDate?: string;

    @ApiProperty({ description: 'Mã phiếu GPB / HIS / tiếp nhận (bắt buộc)' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiPropertyOptional({ description: 'Tên bệnh nhân (partial)' })
    @IsOptional()
    @IsString()
    patientName?: string;

    @ApiPropertyOptional({ description: 'Phòng thực hiện (LIS room id)' })
    @IsOptional()
    @IsString()
    roomId?: string;

    @ApiPropertyOptional({ description: 'Loại sự kiện', isArray: true })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => (Array.isArray(value) ? value : value ? [value] : undefined))
    eventCategory?: string[];

    @ApiPropertyOptional({ default: 20 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @ApiPropertyOptional({ default: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    offset?: number = 0;
}
