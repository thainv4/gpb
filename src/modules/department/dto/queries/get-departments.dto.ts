import { IsOptional, IsString, IsNumber, Min, IsBoolean, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum DepartmentSortBy {
    DEPARTMENT_CODE = 'departmentCode',
    DEPARTMENT_NAME = 'departmentName',
    SORT_ORDER = 'sortOrder',
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
}

export enum DepartmentSortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class GetDepartmentsDto {
    @ApiProperty({
        description: 'Số lượng bản ghi trên mỗi trang',
        example: 10,
        required: false,
        minimum: 1,
    })
    @IsNumber({}, { message: 'Giới hạn phải là số' })
    @Min(1, { message: 'Giới hạn phải lớn hơn hoặc bằng 1' })
    @IsOptional()
    @Type(() => Number)
    limit?: number = 10;

    @ApiProperty({
        description: 'Số lượng bản ghi bỏ qua (offset)',
        example: 0,
        required: false,
        minimum: 0,
    })
    @IsNumber({}, { message: 'Offset phải là số' })
    @Min(0, { message: 'Offset phải lớn hơn hoặc bằng 0' })
    @IsOptional()
    @Type(() => Number)
    offset?: number = 0;

    @ApiProperty({
        description: 'Từ khóa tìm kiếm (mã, tên, trưởng khoa, điều dưỡng trưởng)',
        example: 'tim mạch',
        required: false,
    })
    @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi' })
    @IsOptional()
    search?: string;

    @ApiProperty({
        description: 'Lọc theo trạng thái hoạt động',
        example: true,
        required: false,
    })
    @IsBoolean({ message: 'Trạng thái hoạt động phải là boolean' })
    @IsOptional()
    @Type(() => Boolean)
    isActive?: boolean;

    @ApiProperty({
        description: 'Lọc theo ID chi nhánh',
        example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        required: false,
    })
    @IsString({ message: 'ID chi nhánh phải là chuỗi' })
    @IsOptional()
    @IsUUID('4', { message: 'ID chi nhánh phải là UUID hợp lệ' })
    branchId?: string;

    @ApiProperty({
        description: 'Lọc theo ID loại khoa',
        example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        required: false,
    })
    @IsString({ message: 'ID loại khoa phải là chuỗi' })
    @IsOptional()
    @IsUUID('4', { message: 'ID loại khoa phải là UUID hợp lệ' })
    departmentTypeId?: string;

    @ApiProperty({
        description: 'Lọc theo ID khoa cha (null = khoa gốc)',
        example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        required: false,
    })
    @IsString({ message: 'ID khoa cha phải là chuỗi' })
    @IsOptional()
    @IsUUID('4', { message: 'ID khoa cha phải là UUID hợp lệ' })
    parentDepartmentId?: string;

    @ApiProperty({
        description: 'Sắp xếp theo trường',
        enum: DepartmentSortBy,
        example: DepartmentSortBy.SORT_ORDER,
        required: false,
    })
    @IsEnum(DepartmentSortBy, { message: 'Trường sắp xếp không hợp lệ' })
    @IsOptional()
    sortBy?: DepartmentSortBy = DepartmentSortBy.SORT_ORDER;

    @ApiProperty({
        description: 'Thứ tự sắp xếp',
        enum: DepartmentSortOrder,
        example: DepartmentSortOrder.ASC,
        required: false,
    })
    @IsEnum(DepartmentSortOrder, { message: 'Thứ tự sắp xếp không hợp lệ' })
    @IsOptional()
    sortOrder?: DepartmentSortOrder = DepartmentSortOrder.ASC;
}

export interface GetDepartmentsResult {
    departments: any[];
    total: number;
    limit: number;
    offset: number;
}
