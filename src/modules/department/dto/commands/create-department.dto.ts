import { IsString, IsNotEmpty, Length, IsOptional, IsNumber, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
    @ApiProperty({
        description: 'Mã khoa (duy nhất)',
        example: 'KTM',
        minLength: 2,
        maxLength: 20,
    })
    @IsString({ message: 'Mã khoa phải là chuỗi' })
    @IsNotEmpty({ message: 'Mã khoa không được để trống' })
    @Length(2, 20, { message: 'Mã khoa phải từ 2 đến 20 ký tự' })
    departmentCode: string;

    @ApiProperty({
        description: 'Tên khoa',
        example: 'Khoa Tim Mạch',
        minLength: 2,
        maxLength: 100,
    })
    @IsString({ message: 'Tên khoa phải là chuỗi' })
    @IsNotEmpty({ message: 'Tên khoa không được để trống' })
    @Length(2, 100, { message: 'Tên khoa phải từ 2 đến 100 ký tự' })
    departmentName: string;

    @ApiProperty({
        description: 'ID chi nhánh',
        example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    })
    @IsString({ message: 'ID chi nhánh phải là chuỗi' })
    @IsNotEmpty({ message: 'ID chi nhánh không được để trống' })
    branchId: string;

    @ApiProperty({
        description: 'Trưởng khoa',
        example: 'BS. Nguyễn Văn A',
        required: false,
        maxLength: 100,
    })
    @IsString({ message: 'Trưởng khoa phải là chuỗi' })
    @IsOptional()
    @Length(0, 100, { message: 'Trưởng khoa không được vượt quá 100 ký tự' })
    headOfDepartment?: string;

    @ApiProperty({
        description: 'Điều dưỡng trưởng',
        example: 'ĐD. Trần Thị B',
        required: false,
        maxLength: 100,
    })
    @IsString({ message: 'Điều dưỡng trưởng phải là chuỗi' })
    @IsOptional()
    @Length(0, 100, { message: 'Điều dưỡng trưởng không được vượt quá 100 ký tự' })
    headNurse?: string;

    @ApiProperty({
        description: 'ID khoa cha (để tạo cấu trúc phân cấp)',
        example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        required: false,
    })
    @IsString({ message: 'ID khoa cha phải là chuỗi' })
    @IsOptional()
    parentDepartmentId?: string;

    @ApiProperty({
        description: 'Tên viết tắt',
        example: 'KTM',
        required: false,
        maxLength: 50,
    })
    @IsString({ message: 'Tên viết tắt phải là chuỗi' })
    @IsOptional()
    @Length(0, 50, { message: 'Tên viết tắt không được vượt quá 50 ký tự' })
    shortName?: string;

    @ApiProperty({
        description: 'ID loại khoa',
        example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    })
    @IsString({ message: 'ID loại khoa phải là chuỗi' })
    @IsNotEmpty({ message: 'ID loại khoa không được để trống' })
    departmentTypeId: string;

    @ApiProperty({
        description: 'Thứ tự sắp xếp',
        example: 1,
        required: false,
        minimum: 0,
    })
    @IsNumber({}, { message: 'Thứ tự sắp xếp phải là số' })
    @IsOptional()
    @Min(0, { message: 'Thứ tự sắp xếp không được nhỏ hơn 0' })
    sortOrder?: number;
}
