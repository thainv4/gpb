import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetPivkaIiResultsDto {
    @ApiPropertyOptional({ description: 'Số lượng bản ghi trả về', example: 10 })
    @IsOptional()
    @IsInt()
    @Min(1)
    limit?: number;

    @ApiPropertyOptional({ description: 'Vị trí bắt đầu', example: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    offset?: number;

    @ApiPropertyOptional({ description: 'Trường sắp xếp', example: 'createdAt', enum: ['createdAt', 'updatedAt', 'id'] })
    @IsOptional()
    @IsString()
    sortBy?: 'createdAt' | 'updatedAt' | 'id';

    @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', example: 'DESC', enum: ['ASC', 'DESC'] })
    @IsOptional()
    @IsIn(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC';
}

