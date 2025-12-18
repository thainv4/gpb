import { IsOptional, IsString, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GetServiceGroupsDto {
    @ApiPropertyOptional({ description: 'Số lượng bản ghi trên mỗi trang', example: 10, minimum: 1, maximum: 100 })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Số bản ghi bỏ qua', example: 0, minimum: 0 })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(0)
    offset?: number = 0;

    @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm', example: 'xét nghiệm' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Lọc theo trạng thái hoạt động', example: true })
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({ description: 'Sắp xếp theo trường', example: 'sortOrder' })
    @IsOptional()
    @IsString()
    sortBy?: string = 'sortOrder';

    @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', example: 'ASC', enum: ['ASC', 'DESC'] })
    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
