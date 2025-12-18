import { ApiProperty } from '@nestjs/swagger';

export class RoomGroupResponseDto {
    @ApiProperty({ description: 'ID của nhóm phòng', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
    id: string;

    @ApiProperty({ description: 'Mã nhóm phòng', example: 'VIP' })
    roomGroupCode: string;

    @ApiProperty({ description: 'Tên nhóm phòng', example: 'Phòng VIP' })
    roomGroupName: string;

    @ApiProperty({ description: 'Tên hiển thị của nhóm phòng', example: 'VIP - Phòng VIP' })
    displayName: string;

    @ApiProperty({ description: 'Thứ tự sắp xếp', example: 1 })
    sortOrder: number;

    @ApiProperty({ description: 'Trạng thái hoạt động', example: true })
    isActive: boolean;

    @ApiProperty({ description: 'Phiên bản của bản ghi', example: 1 })
    version: number;

    @ApiProperty({ description: 'Thời gian tạo', example: '2023-01-01T12:00:00Z' })
    createdAt: Date;

    @ApiProperty({ description: 'Thời gian cập nhật cuối cùng', example: '2023-01-01T12:00:00Z' })
    updatedAt: Date;
}
