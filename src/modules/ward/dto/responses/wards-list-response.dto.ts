import { ApiProperty } from '@nestjs/swagger';
import { WardResponseDto } from './ward-response.dto';

export class WardPaginationDto {
    @ApiProperty({
        description: 'Tổng số bản ghi',
        example: 1000
    })
    total: number;

    @ApiProperty({
        description: 'Số lượng bản ghi trên trang',
        example: 10
    })
    limit: number;

    @ApiProperty({
        description: 'Vị trí bắt đầu',
        example: 0
    })
    offset: number;

    @ApiProperty({
        description: 'Có trang tiếp theo',
        example: true
    })
    hasNext: boolean;

    @ApiProperty({
        description: 'Có trang trước',
        example: false
    })
    hasPrev: boolean;

    @ApiProperty({
        description: 'Tổng số trang',
        example: 100
    })
    totalPages: number;

    @ApiProperty({
        description: 'Trang hiện tại',
        example: 1
    })
    currentPage: number;
}

export class WardsListResponseDto {
    @ApiProperty({
        description: 'Danh sách các xã',
        type: [WardResponseDto]
    })
    wards: WardResponseDto[];

    @ApiProperty({
        description: 'Thông tin phân trang',
        type: WardPaginationDto
    })
    pagination: WardPaginationDto;

    @ApiProperty({
        description: 'Thông tin thống kê',
        example: {
            total: 1000,
            active: 950,
            inactive: 50,
            byProvince: {
                '550e8400-e29b-41d4-a716-446655440001': 30,
                '550e8400-e29b-41d4-a716-446655440002': 25
            }
        }
    })
    statistics: {
        total: number;
        active: number;
        inactive: number;
        byProvince?: { [provinceId: string]: number };
    };
}
