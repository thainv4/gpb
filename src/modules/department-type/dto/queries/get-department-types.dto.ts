import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsBoolean, IsString, Min, Max, Length } from 'class-validator';
import { Type } from 'class-transformer';

export enum DepartmentTypeSortBy {
    TYPE_CODE = 'typeCode',
    TYPE_NAME = 'typeName',
    SORT_ORDER = 'sortOrder',
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
}

export enum DepartmentTypeSortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class GetDepartmentTypesDto {
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
        description: 'Từ khóa tìm kiếm',
        example: 'khoa',
        required: false,
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @Length(0, 100)
    search?: string;

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
        example: DepartmentTypeSortBy.SORT_ORDER,
        enum: DepartmentTypeSortBy,
        required: false,
    })
    @IsOptional()
    @IsString()
    sortBy?: DepartmentTypeSortBy = DepartmentTypeSortBy.SORT_ORDER;

    @ApiProperty({
        description: 'Thứ tự sắp xếp',
        example: DepartmentTypeSortOrder.ASC,
        enum: DepartmentTypeSortOrder,
        required: false,
    })
    @IsOptional()
    @IsString()
    sortOrder?: DepartmentTypeSortOrder = DepartmentTypeSortOrder.ASC;
}
