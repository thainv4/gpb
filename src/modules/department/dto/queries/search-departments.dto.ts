import { PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GetDepartmentsDto, DepartmentSortBy, DepartmentSortOrder } from './get-departments.dto';
import { Type } from 'class-transformer';

export class SearchDepartmentsDto extends PartialType(GetDepartmentsDto) {
    @ApiProperty({
        description: 'Từ khóa tìm kiếm (mã, tên, trưởng khoa, điều dưỡng trưởng)',
        example: 'tim mạch',
        required: false,
    })
    @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi' })
    @IsNotEmpty({ message: 'Từ khóa tìm kiếm không được để trống' })
    @Length(1, 100, { message: 'Từ khóa tìm kiếm phải từ 1 đến 100 ký tự' })
    keyword: string;

    @ApiProperty({
        description: 'Lọc theo trạng thái hoạt động',
        example: true,
        required: false,
    })
    @IsBoolean({ message: 'Trạng thái hoạt động phải là boolean' })
    @IsOptional()
    @Type(() => Boolean)
    isActive?: boolean;
}
