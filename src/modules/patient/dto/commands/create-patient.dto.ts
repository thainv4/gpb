import { IsString, IsNotEmpty, IsOptional, IsDateString, Matches, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePatientDto {
    @ApiPropertyOptional({ description: 'Mã bệnh nhân (tự động tạo nếu không có)', example: 'BN202401.0001' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    patientCode?: string;

    @ApiProperty({ description: 'Họ tên bệnh nhân', example: 'Nguyễn Văn A' })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(200)
    patientName: string;

    @ApiProperty({ description: 'Ngày sinh', example: '1990-01-15' })
    @IsDateString()
    dateOfBirth: string;

    @ApiProperty({ description: 'Số CMND/CCCD', example: '123456789' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^\d{9,12}$/, { message: 'CMND must be 9-12 digits' })
    cmndNumber: string;

    @ApiPropertyOptional({ description: 'Ngày cấp CMND', example: '2010-01-15' })
    @IsOptional()
    @IsDateString()
    cmndDate?: string;

    @ApiPropertyOptional({ description: 'Nơi cấp CMND', example: 'Công an TP.HCM' })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    cmndPlace?: string;

    @ApiPropertyOptional({ description: 'Số điện thoại di động', example: '0901234567' })
    @IsOptional()
    @IsString()
    @Matches(/^[0-9]{10,11}$/, { message: 'Mobile must be 10-11 digits' })
    mobile?: string;

    @ApiPropertyOptional({ description: 'Số điện thoại cố định', example: '0281234567' })
    @IsOptional()
    @IsString()
    @Matches(/^[0-9]{8,11}$/, { message: 'Phone must be 8-11 digits' })
    phone?: string;

    @ApiProperty({ description: 'ID tỉnh', example: 'uuid-province-id' })
    @IsString()
    @IsNotEmpty()
    provinceId: string;

    @ApiProperty({ description: 'ID phường/xã', example: 'uuid-ward-id' })
    @IsString()
    @IsNotEmpty()
    wardId: string;

    @ApiProperty({ description: 'Địa chỉ chi tiết', example: '123 Đường ABC, Phường XYZ' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    address: string;

    @ApiProperty({ description: 'ID giới tính', example: 'uuid-gender-id' })
    @IsString()
    @IsNotEmpty()
    genderId: string;

    @ApiProperty({ description: 'Tên giới tính', example: 'Nam' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    genderName: string;

    @ApiPropertyOptional({ description: 'Nghề nghiệp', example: 'Bác sĩ' })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    careerName?: string;

    @ApiPropertyOptional({ description: 'ID từ hệ thống HIS', example: 'HIS123456' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    hisId?: string;
}
