import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PatientResponseDto {
    @ApiProperty({ description: 'ID bệnh nhân' })
    id: string;

    @ApiProperty({ description: 'Mã bệnh nhân' })
    patientCode: string;

    @ApiProperty({ description: 'Họ tên bệnh nhân' })
    patientName: string;

    @ApiProperty({ description: 'Ngày sinh (YYYY-MM-DD)' })
    dateOfBirth: string;

    @ApiProperty({ description: 'Tuổi' })
    age: number;

    @ApiProperty({ description: 'Số CMND/CCCD' })
    cmndNumber: string;

    @ApiPropertyOptional({ description: 'Ngày cấp CMND (YYYY-MM-DD)' })
    cmndDate?: string;

    @ApiPropertyOptional({ description: 'Nơi cấp CMND' })
    cmndPlace?: string;

    @ApiPropertyOptional({ description: 'Số điện thoại di động' })
    mobile?: string;

    @ApiPropertyOptional({ description: 'Số điện thoại cố định' })
    phone?: string;

    @ApiPropertyOptional({ description: 'ID tỉnh' })
    provinceId?: string;

    @ApiPropertyOptional({ description: 'ID phường/xã' })
    wardId?: string;

    @ApiProperty({ description: 'Địa chỉ chi tiết' })
    address: string;

    @ApiProperty({ description: 'Địa chỉ đầy đủ' })
    fullAddress: string;

    @ApiProperty({ description: 'ID giới tính' })
    genderId: string;

    @ApiProperty({ description: 'Tên giới tính' })
    genderName: string;

    @ApiProperty({ description: 'Tên hiển thị' })
    displayName: string;

    @ApiPropertyOptional({ description: 'Nghề nghiệp' })
    careerName?: string;

    @ApiPropertyOptional({ description: 'ID từ hệ thống HIS' })
    hisId?: string;

    @ApiProperty({ description: 'Ngày tạo' })
    createdAt: Date;

    @ApiProperty({ description: 'Ngày cập nhật' })
    updatedAt: Date;

    @ApiPropertyOptional({ description: 'Người tạo' })
    createdBy?: string;

    @ApiPropertyOptional({ description: 'Người cập nhật' })
    updatedBy?: string;
}
