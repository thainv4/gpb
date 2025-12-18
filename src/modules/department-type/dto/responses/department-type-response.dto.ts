import { ApiProperty } from '@nestjs/swagger';

export class DepartmentTypeResponseDto {
    @ApiProperty({
        description: 'ID loại khoa',
        example: '550e8400-e29b-41d4-a716-446655440001',
    })
    id: string;

    @ApiProperty({
        description: 'Mã loại khoa',
        example: 'KHOA',
    })
    typeCode: string;

    @ApiProperty({
        description: 'Tên loại khoa',
        example: 'Khoa',
    })
    typeName: string;

    @ApiProperty({
        description: 'Mô tả loại khoa',
        example: 'Các khoa chuyên môn trong bệnh viện',
        required: false,
    })
    description?: string;

    @ApiProperty({
        description: 'Tên hiển thị',
        example: 'KHOA - Khoa',
    })
    displayName: string;

    @ApiProperty({
        description: 'Thứ tự sắp xếp',
        example: 1,
    })
    sortOrder: number;

    @ApiProperty({
        description: 'Trạng thái hoạt động',
        example: true,
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Phiên bản',
        example: 1,
    })
    version: number;

    @ApiProperty({
        description: 'Ngày tạo',
        example: '2024-01-15T10:30:00Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Ngày cập nhật',
        example: '2024-01-15T10:30:00Z',
    })
    updatedAt: Date;
}
