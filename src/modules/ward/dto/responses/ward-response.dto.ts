import { ApiProperty } from '@nestjs/swagger';

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

export class WardResponseDto {
    @ApiProperty({
        description: 'ID duy nhất của xã',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    id: string;

    @ApiProperty({
        description: 'Mã xã (5 chữ số)',
        example: '01001'
    })
    wardCode: string;

    @ApiProperty({
        description: 'Tên xã',
        example: 'Phường Phúc Xá'
    })
    wardName: string;

    @ApiProperty({
        description: 'ID của tỉnh',
        example: '550e8400-e29b-41d4-a716-446655440001'
    })
    provinceId: string;

    @ApiProperty({
        description: 'Tên viết tắt của xã',
        example: 'PX'
    })
    shortName: string;

    @ApiProperty({
        description: 'Thứ tự sắp xếp',
        example: 1
    })
    sortOrder: number;

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
        example: '01001 - Phường Phúc Xá'
    })
    displayName: string;

    @ApiProperty({
        description: 'Thông tin tỉnh',
        type: ProvinceInfoDto,
        required: false
    })
    province?: ProvinceInfoDto;
}
