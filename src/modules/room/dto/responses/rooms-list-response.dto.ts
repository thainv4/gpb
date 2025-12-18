import { ApiProperty } from '@nestjs/swagger';
import { RoomResponseDto } from './room-response.dto';

export class RoomPaginationDto {
    @ApiProperty({
        description: 'Tổng số bản ghi',
        example: 100,
    })
    total: number;

    @ApiProperty({
        description: 'Số lượng bản ghi trả về',
        example: 10,
    })
    limit: number;

    @ApiProperty({
        description: 'Vị trí bắt đầu',
        example: 0,
    })
    offset: number;

    @ApiProperty({
        description: 'Có trang tiếp theo',
        example: true,
    })
    hasNext: boolean;

    @ApiProperty({
        description: 'Có trang trước',
        example: false,
    })
    hasPrev: boolean;
}

export class RoomsListResponseDto {
    @ApiProperty({
        description: 'Danh sách phòng',
        type: [RoomResponseDto],
    })
    rooms: RoomResponseDto[];

    @ApiProperty({
        description: 'Thông tin phân trang',
        type: RoomPaginationDto,
    })
    pagination: RoomPaginationDto;
}
