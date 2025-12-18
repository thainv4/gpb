import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, IsOptional, IsDateString, IsIn, IsUrl, Matches, Length, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterWithProfileDto {
    // User fields
    @ApiProperty({
        description: 'Username for the user account',
        example: 'john_doe',
        minLength: 3,
        maxLength: 50
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    username: string;

    @ApiProperty({
        description: 'Email address of the user',
        example: 'john.doe@example.com',
        format: 'email'
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: 'Password for the user account',
        example: 'SecurePass123!',
        minLength: 8
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @ApiProperty({
        description: 'Full name of the user',
        example: 'John Doe',
        minLength: 2,
        maxLength: 100
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    fullName: string;

    // Profile fields
    @ApiPropertyOptional({ description: 'ID tỉnh/thành phố' })
    @IsOptional()
    provinceId?: string;

    @ApiPropertyOptional({ description: 'ID xã/phường' })
    @IsOptional()
    wardId?: string;

    @ApiPropertyOptional({ description: 'Địa chỉ chi tiết', example: '123 Đường ABC' })
    @IsString()
    @IsOptional()
    @Length(1, 500)
    address?: string;

    @ApiPropertyOptional({ description: 'ID khoa/phòng ban' })
    @IsOptional()
    departmentId?: string;

    @ApiPropertyOptional({ description: 'Chức vụ', example: 'Bác sĩ' })
    @IsString()
    @IsOptional()
    @Length(1, 100)
    position?: string;

    @ApiPropertyOptional({ description: 'Mã nhân viên', example: 'NV001' })
    @IsString()
    @IsOptional()
    @Length(1, 50)
    employeeCode?: string;

    @ApiPropertyOptional({ description: 'Số điện thoại', example: '0123456789' })
    @IsString()
    @IsOptional()
    @Matches(/^[0-9+\-\s()]+$/, { message: 'Số điện thoại không hợp lệ' })
    @Length(10, 20)
    phoneNumber?: string;

    @ApiPropertyOptional({ description: 'Ngày sinh', example: '1990-01-01' })
    @IsDateString()
    @IsOptional()
    dateOfBirth?: string;

    @ApiPropertyOptional({ description: 'Giới tính', example: 'MALE' })
    @IsString()
    @IsOptional()
    @IsIn(['MALE', 'FEMALE', 'OTHER'])
    gender?: string;

    @ApiPropertyOptional({ description: 'URL ảnh đại diện', example: 'https://example.com/avatar.jpg' })
    @IsString()
    @IsOptional()
    @IsUrl()
    @Length(1, 500)
    avatar?: string;

    @ApiPropertyOptional({ description: 'Username cho hệ thống tích hợp', example: 'admin_his' })
    @IsString()
    @IsOptional()
    @Length(3, 100)
    mappedUsername?: string;

    @ApiPropertyOptional({ description: 'Password cho hệ thống tích hợp', example: 'his_password_123' })
    @IsString()
    @IsOptional()
    @Length(6, 100)
    mappedPassword?: string;
}

