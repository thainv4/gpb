import { ApiProperty } from '@nestjs/swagger';
import { UserRoomResponseDto } from './user-room-response.dto';

export class UserRoomsListResponseDto {
    @ApiProperty({ description: 'Danh sách phân quyền phòng', type: [UserRoomResponseDto] })
    userRooms: UserRoomResponseDto[];

    @ApiProperty({ description: 'Tổng số bản ghi' })
    total: number;
}

export interface GetUserRoomsResult {
    userRooms: UserRoomResponseDto[];
    total: number;
    limit: number;
    offset: number;
}
