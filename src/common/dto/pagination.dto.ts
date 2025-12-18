import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PaginationDto {
    @ApiPropertyOptional({
        description: 'Số lượng bản ghi mỗi trang',
        example: 10,
        minimum: 1,
        maximum: 100,
        default: 10
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'limit phải là số' })
    @Min(1, { message: 'limit phải lớn hơn 0' })
    @Max(100, { message: 'limit không được vượt quá 100' })
    limit?: number = 10;

    @ApiPropertyOptional({
        description: 'Vị trí bắt đầu lấy bản ghi',
        example: 0,
        minimum: 0,
        default: 0
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'offset phải là số' })
    @Min(0, { message: 'offset phải lớn hơn hoặc bằng 0' })
    offset?: number = 0;
}
