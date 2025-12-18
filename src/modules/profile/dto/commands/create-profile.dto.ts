import { IsString, IsOptional, Length, IsUUID, IsDateString, IsIn, IsUrl, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProfileDto {
    // userId sẽ được lấy từ currentUser, không cần truyền từ client

    // Thông tin địa chỉ
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

    // Thông tin công việc
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

    // Thông tin cá nhân
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

    // Mapping fields
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
