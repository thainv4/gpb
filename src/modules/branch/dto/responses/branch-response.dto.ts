import { ApiProperty } from '@nestjs/swagger';
import { HospitalLevel } from '../commands/create-branch.dto';

export class ProvinceInfoDto {
    @ApiProperty({
        description: 'ID của tỉnh',
        example: '550e8400-e29b-41d4-a716-446655440001'
    })
    id: string;

    @ApiProperty({
        description: 'Mã tỉnh',
        example: '01'
    })
    provinceCode: string;

    @ApiProperty({
        description: 'Tên tỉnh',
        example: 'Hà Nội'
    })
    provinceName: string;

    @ApiProperty({
        description: 'Tên viết tắt của tỉnh',
        example: 'HN'
    })
    shortName: string;
}

export class WardInfoDto {
    @ApiProperty({
        description: 'ID của xã',
        example: '550e8400-e29b-41d4-a716-446655440101'
    })
    id: string;

    @ApiProperty({
        description: 'Mã xã',
        example: '01001'
    })
    wardCode: string;

    @ApiProperty({
        description: 'Tên xã',
        example: 'Phường Phúc Xá'
    })
    wardName: string;

    @ApiProperty({
        description: 'Tên viết tắt của xã',
        example: 'PX'
    })
    shortName: string;
}

export class BranchResponseDto {
    @ApiProperty({
        description: 'ID duy nhất của chi nhánh',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    id: string;

    @ApiProperty({
        description: 'Mã chi nhánh',
        example: 'HN001'
    })
    branchCode: string;

    @ApiProperty({
        description: 'Tên chi nhánh',
        example: 'Chi nhánh Hà Nội'
    })
    branchName: string;

    @ApiProperty({
        description: 'Tên viết tắt của chi nhánh',
        example: 'CN HN'
    })
    shortName: string;

    @ApiProperty({
        description: 'ID của tỉnh',
        example: '550e8400-e29b-41d4-a716-446655440001'
    })
    provinceId: string;

    @ApiProperty({
        description: 'ID của xã',
        example: '550e8400-e29b-41d4-a716-446655440101'
    })
    wardId: string;

    @ApiProperty({
        description: 'Địa chỉ chi tiết',
        example: '123 Đường ABC, Phường XYZ'
    })
    address: string;

    @ApiProperty({
        description: 'Số điện thoại',
        example: '0123456789'
    })
    phoneNumber: string;

    @ApiProperty({
        description: 'Cấp bệnh viện',
        enum: HospitalLevel,
        example: HospitalLevel.TUYEN_1
    })
    hospitalLevel: HospitalLevel;

    @ApiProperty({
        description: 'Người đại diện',
        example: 'Nguyễn Văn A'
    })
    representative: string;

    @ApiProperty({
        description: 'Mã BHYT',
        example: '1234567890'
    })
    bhyCode: string;

    @ApiProperty({
        description: 'Trạng thái hoạt động',
        example: true
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Ngày tạo',
        example: '2024-01-15T10:30:00.000Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Ngày cập nhật cuối',
        example: '2024-01-15T10:30:00.000Z'
    })
    updatedAt: Date;

    @ApiProperty({
        description: 'Người tạo',
        example: 'admin',
        required: false
    })
    createdBy?: string;

    @ApiProperty({
        description: 'Người cập nhật cuối',
        example: 'admin',
        required: false
    })
    updatedBy?: string;

    @ApiProperty({
        description: 'Phiên bản',
        example: 1
    })
    version: number;

    @ApiProperty({
        description: 'Tên hiển thị (Mã - Tên)',
        example: 'HN001 - Chi nhánh Hà Nội'
    })
    displayName: string;

    @ApiProperty({
        description: 'Địa chỉ đầy đủ',
        example: '123 Đường ABC, Phường XYZ, Hà Nội'
    })
    fullAddress: string;

    @ApiProperty({
        description: 'Thông tin tỉnh',
        type: ProvinceInfoDto,
        required: false
    })
    province?: ProvinceInfoDto;

    @ApiProperty({
        description: 'Thông tin xã',
        type: WardInfoDto,
        required: false
    })
    ward?: WardInfoDto;
}
