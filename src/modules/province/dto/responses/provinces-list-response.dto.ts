import { ApiProperty } from '@nestjs/swagger';
import { ProvinceResponseDto } from './province-response.dto';

export class ProvincePaginationDto {
    @ApiProperty({
        description: 'Tổng số bản ghi',
        example: 63
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
        example: 7
    })
    totalPages: number;

    @ApiProperty({
        description: 'Trang hiện tại',
        example: 1
    })
    currentPage: number;
}

export class ProvincesListResponseDto {
    @ApiProperty({
        description: 'Danh sách các tỉnh',
        type: [ProvinceResponseDto]
    })
    provinces: ProvinceResponseDto[];

    @ApiProperty({
        description: 'Thông tin phân trang',
        type: ProvincePaginationDto
    })
    pagination: ProvincePaginationDto;

    @ApiProperty({
        description: 'Thông tin thống kê',
        example: {
            total: 63,
            active: 60,
            inactive: 3
        }
    })
    statistics: {
        total: number;
        active: number;
        inactive: number;
    };
}
