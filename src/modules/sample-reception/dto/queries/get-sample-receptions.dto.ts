import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class GetSampleReceptionsDto {
    @ApiPropertyOptional({ description: 'Số lượng bản ghi trên mỗi trang', example: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Số lượng bản ghi bỏ qua', example: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    offset?: number = 0;

    @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm theo mã tiếp nhận hoặc tên loại mẫu', example: 'BLOOD' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Trường để sắp xếp', example: 'receptionDate', enum: ['receptionCode', 'receptionDate', 'sequenceNumber', 'createdAt'] })
    @IsOptional()
    @IsString()
    @IsIn(['receptionCode', 'receptionDate', 'sequenceNumber', 'createdAt'])
    sortBy?: string = 'receptionDate';

    @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', example: 'DESC', enum: ['ASC', 'DESC'] })
    @IsOptional()
    @IsString()
    @IsIn(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
