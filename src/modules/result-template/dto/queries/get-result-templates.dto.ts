import { IsOptional, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetResultTemplatesDto {
    @ApiProperty({
        description: 'Số lượng bản ghi trên mỗi trang',
        example: 10,
        required: false,
        minimum: 1
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;

    @ApiProperty({
        description: 'Số bản ghi bỏ qua',
        example: 0,
        required: false,
        minimum: 0
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    offset?: number = 0;

    @ApiProperty({
        description: 'Trường để sắp xếp',
        example: 'RESULT_TEXT_TEMPLATE',
        required: false
    })
    @IsOptional()
    sortBy?: string = 'createdAt';

    @ApiProperty({
        description: 'Thứ tự sắp xếp',
        example: 'ASC',
        enum: ['ASC', 'DESC'],
        required: false
    })
    @IsOptional()
    @IsIn(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

