import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum SearchType {
    NAME = 'name',
    CODE = 'code',
    SHORT_NAME = 'shortName',
    ALL = 'all',
}

export enum SearchSortBy {
    SORT_ORDER = 'sortOrder',
    WARD_NAME = 'wardName',
    WARD_CODE = 'wardCode',
    CREATED_AT = 'createdAt',
}

export enum SearchSortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class SearchWardsDto {
    @ApiProperty({
        description: 'Từ khóa tìm kiếm',
        example: 'Phúc Xá',
        minLength: 1,
        maxLength: 100
    })
    @IsString()
    @IsNotEmpty()
    @Min(1)
    @Max(100)
    keyword: string;

    @ApiProperty({
        description: 'Loại tìm kiếm',
        enum: SearchType,
        example: SearchType.ALL,
        default: SearchType.ALL,
        required: false
    })
    @IsOptional()
    @IsEnum(SearchType)
    searchType?: SearchType = SearchType.ALL;

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
        enum: SearchSortBy,
        example: SearchSortBy.SORT_ORDER,
        default: SearchSortBy.SORT_ORDER,
        required: false
    })
    @IsOptional()
    @IsEnum(SearchSortBy)
    sortBy?: SearchSortBy = SearchSortBy.SORT_ORDER;

    @ApiProperty({
        description: 'Thứ tự sắp xếp',
        enum: SearchSortOrder,
        example: SearchSortOrder.ASC,
        default: SearchSortOrder.ASC,
        required: false
    })
    @IsOptional()
    @IsEnum(SearchSortOrder)
    sortOrder?: SearchSortOrder = SearchSortOrder.ASC;
}
