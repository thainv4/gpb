import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetEmrSignerDto {
    @ApiProperty({
        description: 'Số bản ghi bắt đầu (pagination offset)',
        example: 0,
        required: false,
        default: 0,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    Start?: number = 0;

    @ApiProperty({
        description: 'Số lượng bản ghi tối đa (pagination limit)',
        example: 10,
        required: false,
        default: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    Limit?: number = 10;

    @ApiProperty({
        description: 'Login name để tìm kiếm (bắt buộc nếu không dùng JWT authentication)',
        example: 'vht2',
        required: false,
    })
    @IsOptional()
    @IsString()
    loginname?: string;
}

