import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetTestingMethodsGenDto {
    @ApiPropertyOptional({ description: 'Số lượng bản ghi', example: 10, minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Vị trí bắt đầu', example: 0, minimum: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    offset?: number = 0;

    @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm theo tên', example: 'Venipuncture' })
    @IsOptional()
    @IsString()
    search?: string;
}
