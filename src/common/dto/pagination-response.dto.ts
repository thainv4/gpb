import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
    @ApiProperty({ description: 'Tổng số bản ghi' })
    total: number;

    @ApiProperty({ description: 'Số lượng mỗi trang' })
    limit: number;

    @ApiProperty({ description: 'Vị trí bắt đầu' })
    offset: number;

    @ApiProperty({ description: 'Có trang tiếp theo không' })
    hasNext: boolean;

    @ApiProperty({ description: 'Có trang trước không' })
    hasPrev: boolean;
}

export class PaginationResponseDto<T> {
    @ApiProperty({ description: 'Dữ liệu' })
    data: T[];

    @ApiProperty({ description: 'Thông tin phân trang', type: PaginationMeta })
    pagination: PaginationMeta;
}
