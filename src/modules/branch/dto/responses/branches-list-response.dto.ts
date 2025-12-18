import { ApiProperty } from '@nestjs/swagger';
import { BranchResponseDto } from './branch-response.dto';

export class BranchPaginationDto {
    @ApiProperty({
        description: 'Tổng số bản ghi',
        example: 100
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
        description: 'Trang hiện tại',
        example: 1
    })
    page: number;

    @ApiProperty({
        description: 'Tổng số trang',
        example: 10
    })
    totalPages: number;

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
}

export class BranchStatsDto {
    @ApiProperty({
        description: 'Tổng số chi nhánh',
        example: 100
    })
    totalBranches: number;

    @ApiProperty({
        description: 'Số chi nhánh đang hoạt động',
        example: 95
    })
    activeBranches: number;

    @ApiProperty({
        description: 'Số chi nhánh không hoạt động',
        example: 5
    })
    inactiveBranches: number;

    @ApiProperty({
        description: 'Số chi nhánh bị xóa mềm',
        example: 0
    })
    softDeletedBranches: number;

    @ApiProperty({
        description: 'Số chi nhánh theo cấp bệnh viện',
        example: {
            'Tuyến 1': 20,
            'Tuyến 2': 30,
            'Tuyến 3': 40,
            'Tuyến 4': 10
        }
    })
    branchesByLevel: Record<string, number>;

    @ApiProperty({
        description: 'Số chi nhánh theo tỉnh',
        example: {
            'Hà Nội': 25,
            'TP.HCM': 30,
            'Đà Nẵng': 15
        }
    })
    branchesByProvince: Record<string, number>;
}

export class BranchesListResponseDto {
    @ApiProperty({
        description: 'Danh sách chi nhánh',
        type: [BranchResponseDto]
    })
    branches: BranchResponseDto[];

    @ApiProperty({
        description: 'Thông tin phân trang',
        type: BranchPaginationDto
    })
    pagination: BranchPaginationDto;

    @ApiProperty({
        description: 'Thống kê tổng quan',
        type: BranchStatsDto,
        required: false
    })
    stats?: BranchStatsDto;
}
