import { ApiProperty } from '@nestjs/swagger';

export class UserRoomResponseDto {
    @ApiProperty({ description: 'ID của phân quyền phòng' })
    id: string;

    @ApiProperty({ description: 'ID của user' })
    userId: string;

    @ApiProperty({ description: 'Username của user' })
    username: string;

    @ApiProperty({ description: 'Tên đầy đủ của user' })
    userFullName: string;

    @ApiProperty({ description: 'ID của phòng' })
    roomId: string;

    @ApiProperty({ description: 'Mã phòng' })
    roomCode: string;

    @ApiProperty({ description: 'Tên phòng' })
    roomName: string;

    @ApiProperty({ description: 'Địa chỉ phòng' })
    roomAddress: string;

    @ApiProperty({ description: 'Mô tả phòng' })
    roomDescription: string;

    @ApiProperty({ description: 'ID khoa' })
    departmentId: string;

    @ApiProperty({ description: 'Tên khoa' })
    departmentName: string;

    @ApiProperty({ description: 'Mã khoa' })
    departmentCode: string;

    @ApiProperty({ description: 'ID nhóm phòng' })
    roomGroupId: string;

    @ApiProperty({ description: 'Tên nhóm phòng' })
    roomGroupName: string;

    @ApiProperty({ description: 'ID cơ sở' })
    branchId: string;

    @ApiProperty({ description: 'Tên cơ sở' })
    branchName: string;

    @ApiProperty({ description: 'Trạng thái hoạt động' })
    isActive: boolean;

    @ApiProperty({ description: 'Thời gian tạo' })
    createdAt: Date;

    @ApiProperty({ description: 'Thời gian cập nhật' })
    updatedAt: Date;
}
