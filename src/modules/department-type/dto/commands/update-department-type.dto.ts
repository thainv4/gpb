import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, Length, Min, Max } from 'class-validator';

export class UpdateDepartmentTypeDto {
    @ApiProperty({
        description: 'Tên loại khoa',
        example: 'Khoa',
        minLength: 2,
        maxLength: 100,
        required: false,
    })
    @IsString()
    @IsOptional()
    @Length(2, 100)
    typeName?: string;

    @ApiProperty({
        description: 'Mô tả loại khoa',
        example: 'Các khoa chuyên môn trong bệnh viện',
        required: false,
        maxLength: 500,
    })
    @IsString()
    @IsOptional()
    @Length(0, 500)
    description?: string;

    @ApiProperty({
        description: 'Thứ tự sắp xếp',
        example: 1,
        minimum: 0,
        maximum: 9999,
        required: false,
    })
    @IsNumber()
    @IsOptional()
    @Min(0)
    @Max(9999)
    sortOrder?: number;

    @ApiProperty({
        description: 'Trạng thái hoạt động',
        example: true,
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
