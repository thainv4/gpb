import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateUnitOfMeasureDto {
    @ApiProperty({ description: 'Mã đơn vị tính', example: 'UOM_PC' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    unitOfMeasureCode: string;

    @ApiProperty({ description: 'Tên đơn vị tính', example: 'Phần trăm' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    unitOfMeasureName: string;

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


