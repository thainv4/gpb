import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetSampleTypesDto {
    @ApiPropertyOptional({ description: 'Số lượng bản ghi trên trang', example: 10, minimum: 1, maximum: 100 })
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

    @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm', example: 'máu' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Sắp xếp theo trường', example: 'sortOrder' })
    @IsOptional()
    @IsString()
    sortBy?: string = 'sortOrder';

    @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', example: 'ASC' })
    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
