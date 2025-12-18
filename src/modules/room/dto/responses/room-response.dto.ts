import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoomResponseDto {
    @ApiProperty({
        description: 'ID phòng',
        example: 'room-001',
    })
    id: string;

    @ApiProperty({
        description: 'Mã phòng',
        example: 'P001',
    })
    roomCode: string;

    @ApiProperty({
        description: 'Tên phòng',
        example: 'Phòng 101',
    })
    roomName: string;

    @ApiPropertyOptional({
        description: 'Địa chỉ phòng',
        example: 'Tầng 1, Khu A',
    })
    roomAddress?: string;

    @ApiProperty({
        description: 'ID khoa',
        example: 'dept-001',
    })
    departmentId: string;

    @ApiProperty({
        description: 'ID nhóm phòng',
        example: 'group-001',
    })
    roomGroupId: string;

    @ApiPropertyOptional({
        description: 'Mô tả phòng',
        example: 'Phòng khám nội tổng hợp',
    })
    description?: string;

    @ApiProperty({
        description: 'Trạng thái hoạt động',
        example: true,
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Thứ tự sắp xếp',
        example: 1,
    })
    sortOrder: number;

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

    @ApiPropertyOptional({
        description: 'Thông tin khoa',
    })
    department?: {
        id: string;
        departmentCode: string;
        departmentName: string;
    };

    @ApiPropertyOptional({
        description: 'Thông tin nhóm phòng',
    })
    roomGroup?: {
        id: string;
        roomGroupCode: string;
        roomGroupName: string;
    };
}
