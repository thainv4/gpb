import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileResponseDto {
    @ApiProperty({ description: 'ID profile', example: 'profile-uuid-here' })
    id: string;

    @ApiProperty({ description: 'ID người dùng', example: 'user-uuid-here' })
    userId: string;

    // Thông tin địa chỉ
    @ApiPropertyOptional({ description: 'ID tỉnh/thành phố' })
    provinceId?: string;

    @ApiPropertyOptional({ description: 'Tên tỉnh/thành phố' })
    provinceName?: string;

    @ApiPropertyOptional({ description: 'ID xã/phường' })
    wardId?: string;

    @ApiPropertyOptional({ description: 'Tên xã/phường' })
    wardName?: string;

    @ApiPropertyOptional({ description: 'Địa chỉ chi tiết' })
    address?: string;

    @ApiPropertyOptional({ description: 'Địa chỉ đầy đủ' })
    fullAddress?: string;

    // Thông tin công việc
    @ApiPropertyOptional({ description: 'ID khoa/phòng ban' })
    departmentId?: string;

    @ApiPropertyOptional({ description: 'Tên khoa/phòng ban' })
    departmentName?: string;

    @ApiPropertyOptional({ description: 'Chức vụ' })
    position?: string;

    @ApiPropertyOptional({ description: 'Mã nhân viên' })
    employeeCode?: string;

    @ApiPropertyOptional({ description: 'Thông tin công việc' })
    workInfo?: string;

    // Thông tin cá nhân
    @ApiPropertyOptional({ description: 'Số điện thoại' })
    phoneNumber?: string;

    @ApiPropertyOptional({ description: 'Ngày sinh' })
    dateOfBirth?: Date;

    @ApiPropertyOptional({ description: 'Tuổi' })
    age?: number;

    @ApiPropertyOptional({ description: 'Giới tính' })
    gender?: string;

    @ApiPropertyOptional({ description: 'URL ảnh đại diện' })
    avatar?: string;

    // Mapping fields
    @ApiPropertyOptional({ description: 'Username cho hệ thống tích hợp' })
    mappedUsername?: string;

    @ApiPropertyOptional({ description: 'Có mapping password hay không' })
    hasMappedPassword?: boolean;

    @ApiProperty({ description: 'Thời gian tạo' })
    createdAt: Date;

    @ApiProperty({ description: 'Thời gian cập nhật' })
    updatedAt: Date;

    @ApiPropertyOptional({ description: 'Người tạo' })
    createdBy?: string;

    @ApiPropertyOptional({ description: 'Người cập nhật' })
    updatedBy?: string;

    @ApiProperty({ description: 'Phiên bản' })
    version: number;
}
