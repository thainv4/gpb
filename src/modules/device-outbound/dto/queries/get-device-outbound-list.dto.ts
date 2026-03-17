import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class GetDeviceOutboundListDto {
    @ApiPropertyOptional({ description: 'Số bản ghi mỗi trang', default: 10, minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Vị trí bắt đầu (offset)', default: 0, minimum: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    offset?: number = 0;

    @ApiPropertyOptional({ description: 'Lọc theo mã tiếp nhận', example: 'S2601.0312' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    receptionCode?: string;

    @ApiPropertyOptional({ description: 'Lọc theo mã dịch vụ', example: 'BM125' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    serviceCode?: string;
}
