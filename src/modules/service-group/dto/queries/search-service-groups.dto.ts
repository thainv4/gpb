import { IsOptional, IsString, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class SearchServiceGroupsDto {
    @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm', example: 'xét nghiệm' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Lọc theo trạng thái hoạt động', example: true })
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({ description: 'Sắp xếp theo trường', example: 'serviceGroupName' })
    @IsOptional()
    @IsString()
    sortBy?: string = 'serviceGroupName';

    @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', example: 'ASC', enum: ['ASC', 'DESC'] })
    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC' = 'ASC';

    @ApiPropertyOptional({ description: 'Số lượng bản ghi tối đa', example: 50, minimum: 1, maximum: 100 })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 50;
}
