import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Length, Min, Max } from 'class-validator';

export class CreateDepartmentTypeDto {
    @ApiProperty({
        description: 'Mã loại khoa',
        example: 'KHOA',
        minLength: 2,
        maxLength: 20,
    })
    @IsString()
    @IsNotEmpty()
    @Length(2, 20)
    typeCode: string;

    @ApiProperty({
        description: 'Tên loại khoa',
        example: 'Khoa',
        minLength: 2,
        maxLength: 100,
    })
    @IsString()
    @IsNotEmpty()
    @Length(2, 100)
    typeName: string;

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
}
