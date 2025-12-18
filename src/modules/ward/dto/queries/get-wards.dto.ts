import { IsOptional, IsNumber, IsString, IsBoolean, IsEnum, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum WardSortBy {
    SORT_ORDER = 'sortOrder',
    WARD_NAME = 'wardName',
    WARD_CODE = 'wardCode',
    CREATED_AT = 'createdAt',
}

export enum WardSortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class GetWardsDto {
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
        enum: WardSortBy,
        example: WardSortBy.SORT_ORDER,
        default: WardSortBy.SORT_ORDER,
        required: false
    })
    @IsOptional()
    @IsEnum(WardSortBy)
    sortBy?: WardSortBy = WardSortBy.SORT_ORDER;

    @ApiProperty({
        description: 'Thứ tự sắp xếp',
        enum: WardSortOrder,
        example: WardSortOrder.ASC,
        default: WardSortOrder.ASC,
        required: false
    })
    @IsOptional()
    @IsEnum(WardSortOrder)
    sortOrder?: WardSortOrder = WardSortOrder.ASC;

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
        description: 'Lọc theo ID tỉnh',
        example: '550e8400-e29b-41d4-a716-446655440001',
        required: false
    })
    @IsOptional()
    @IsString()
    @IsUUID()
    provinceId?: string;

    @ApiProperty({
        description: 'Tìm kiếm theo tên, mã hoặc tên viết tắt',
        example: 'Phúc Xá',
        required: false
    })
    @IsOptional()
    @IsString()
    search?: string;
}
