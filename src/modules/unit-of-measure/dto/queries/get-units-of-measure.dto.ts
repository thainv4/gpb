import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUnitsOfMeasureDto {
    @ApiPropertyOptional({ description: 'Limit', example: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Offset', example: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    offset?: number = 0;

    @ApiPropertyOptional({ description: 'Filter theo mã', example: 'UOM_PC' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    code?: string;

    @ApiPropertyOptional({ description: 'Filter theo tên (contains)', example: 'phần trăm' })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    name?: string;
}


