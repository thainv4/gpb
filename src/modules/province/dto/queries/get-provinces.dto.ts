import { IsOptional, IsNumber, IsString, IsBoolean, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum ProvinceSortBy {
    SORT_ORDER = 'sortOrder',
    PROVINCE_NAME = 'provinceName',
    PROVINCE_CODE = 'provinceCode',
    CREATED_AT = 'createdAt',
}

export enum ProvinceSortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class GetProvincesDto {
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
        enum: ProvinceSortBy,
        example: ProvinceSortBy.SORT_ORDER,
        default: ProvinceSortBy.SORT_ORDER,
        required: false
    })
    @IsOptional()
    @IsEnum(ProvinceSortBy)
    sortBy?: ProvinceSortBy = ProvinceSortBy.SORT_ORDER;

    @ApiProperty({
        description: 'Thứ tự sắp xếp',
        enum: ProvinceSortOrder,
        example: ProvinceSortOrder.ASC,
        default: ProvinceSortOrder.ASC,
        required: false
    })
    @IsOptional()
    @IsEnum(ProvinceSortOrder)
    sortOrder?: ProvinceSortOrder = ProvinceSortOrder.ASC;

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
        example: 'Hà Nội',
        required: false
    })
    @IsOptional()
    @IsString()
    search?: string;
}
