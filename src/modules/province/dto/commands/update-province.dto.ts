import { IsString, IsOptional, IsNumber, IsBoolean, MinLength, MaxLength, Matches, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProvinceDto {
    @ApiProperty({
        description: 'Mã tỉnh (2 chữ số)',
        example: '01',
        minLength: 2,
        maxLength: 2,
        pattern: '^[0-9]{2}$',
        required: false
    })
    @IsString()
    @IsOptional()
    @MinLength(2)
    @MaxLength(2)
    @Matches(/^[0-9]{2}$/, { message: 'Mã tỉnh phải là 2 chữ số' })
    provinceCode?: string;

    @ApiProperty({
        description: 'Tên tỉnh thành',
        example: 'Hà Nội',
        minLength: 2,
        maxLength: 100,
        required: false
    })
    @IsString()
    @IsOptional()
    @MinLength(2)
    @MaxLength(100)
    provinceName?: string;

    @ApiProperty({
        description: 'Tên viết tắt của tỉnh',
        example: 'HN',
        minLength: 2,
        maxLength: 20,
        required: false
    })
    @IsString()
    @IsOptional()
    @MinLength(2)
    @MaxLength(20)
    shortName?: string;

    @ApiProperty({
        description: 'Thứ tự sắp xếp',
        example: 1,
        minimum: 1,
        maximum: 999,
        required: false
    })
    @IsNumber()
    @IsOptional()
    @Min(1)
    @Max(999)
    sortOrder?: number;

    @ApiProperty({
        description: 'Trạng thái hoạt động',
        example: true,
        required: false
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
