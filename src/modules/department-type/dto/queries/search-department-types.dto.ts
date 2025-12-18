import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsBoolean, IsString, Min, Max, Length } from 'class-validator';
import { Type } from 'class-transformer';

export enum SearchSortBy {
    TYPE_CODE = 'typeCode',
    TYPE_NAME = 'typeName',
    SORT_ORDER = 'sortOrder',
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
}

export enum SearchSortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class SearchDepartmentTypesDto {
    @ApiProperty({
        description: 'Từ khóa tìm kiếm',
        example: 'khoa',
        required: true,
        maxLength: 100,
    })
    @IsString()
    @Length(1, 100)
    keyword: string;

    @ApiProperty({
        description: 'Số lượng bản ghi trên mỗi trang',
        example: 10,
        minimum: 1,
        maximum: 100,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiProperty({
        description: 'Vị trí bắt đầu',
        example: 0,
        minimum: 0,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    offset?: number = 0;

    @ApiProperty({
        description: 'Trạng thái hoạt động',
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isActive?: boolean;

    @ApiProperty({
        description: 'Trường sắp xếp',
        example: SearchSortBy.TYPE_NAME,
        enum: SearchSortBy,
        required: false,
    })
    @IsOptional()
    @IsString()
    sortBy?: SearchSortBy = SearchSortBy.TYPE_NAME;

    @ApiProperty({
        description: 'Thứ tự sắp xếp',
        example: SearchSortOrder.ASC,
        enum: SearchSortOrder,
        required: false,
    })
    @IsOptional()
    @IsString()
    sortOrder?: SearchSortOrder = SearchSortOrder.ASC;
}
