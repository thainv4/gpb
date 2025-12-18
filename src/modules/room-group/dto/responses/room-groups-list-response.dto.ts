import { ApiProperty } from '@nestjs/swagger';
import { RoomGroupResponseDto } from './room-group-response.dto';

export class RoomGroupsListResponseDto {
    @ApiProperty({ type: [RoomGroupResponseDto], description: 'Danh sách các nhóm phòng' })
    roomGroups: RoomGroupResponseDto[];

    @ApiProperty({ description: 'Tổng số nhóm phòng', example: 100 })
    total: number;

    @ApiProperty({ description: 'Số lượng nhóm phòng trên mỗi trang', example: 10 })
    limit: number;

    @ApiProperty({ description: 'Số lượng nhóm phòng đã bỏ qua', example: 0 })
    offset: number;
}
