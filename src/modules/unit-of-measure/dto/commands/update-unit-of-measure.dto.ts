import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUnitOfMeasureDto {
    @ApiPropertyOptional({ description: 'Tên đơn vị tính', example: 'Phần trăm' })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    unitOfMeasureName?: string;

    @ApiPropertyOptional({ description: 'Mô tả', example: 'Đơn vị phần trăm' })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @ApiPropertyOptional({ description: 'Mapping JSON', example: '{"hisCode":"PC"}' })
    @IsOptional()
    @IsString()
    mapping?: string;
}


