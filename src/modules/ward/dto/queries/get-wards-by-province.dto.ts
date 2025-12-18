import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum ProvinceWardSortBy {
    SORT_ORDER = 'sortOrder',
    WARD_NAME = 'wardName',
    WARD_CODE = 'wardCode',
    CREATED_AT = 'createdAt',
}

export enum ProvinceWardSortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class GetWardsByProvinceDto {
    @ApiProperty({
        description: 'ID của tỉnh',
        example: '550e8400-e29b-41d4-a716-446655440001'
    })
    @IsString()
    @IsNotEmpty()
    provinceId: string;

    @ApiProperty({
        description: 'Số lượng bản ghi trả về',
        example: 10,
        minimum: 1,
        maximum: 100,
        default: 10,
        required: false
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiProperty({
        description: 'Vị trí bắt đầu (offset)',
        example: 0,
        minimum: 0,
        default: 0,
        required: false
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(0)
    offset?: number = 0;

    @ApiProperty({
        description: 'Trường để sắp xếp',
        enum: ProvinceWardSortBy,
        example: ProvinceWardSortBy.SORT_ORDER,
        default: ProvinceWardSortBy.SORT_ORDER,
        required: false
    })
    @IsOptional()
    @IsEnum(ProvinceWardSortBy)
    sortBy?: ProvinceWardSortBy = ProvinceWardSortBy.SORT_ORDER;

    @ApiProperty({
        description: 'Thứ tự sắp xếp',
        enum: ProvinceWardSortOrder,
        example: ProvinceWardSortOrder.ASC,
        default: ProvinceWardSortOrder.ASC,
        required: false
    })
    @IsOptional()
    @IsEnum(ProvinceWardSortOrder)
    sortOrder?: ProvinceWardSortOrder = ProvinceWardSortOrder.ASC;

    @ApiProperty({
        description: 'Lọc theo trạng thái hoạt động',
        example: true,
        required: false
    })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({
        description: 'Tìm kiếm theo tên, mã hoặc tên viết tắt',
        example: 'Phúc Xá',
        required: false
    })
    @IsOptional()
    @IsString()
    search?: string;
}
