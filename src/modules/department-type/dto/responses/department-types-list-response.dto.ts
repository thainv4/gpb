import { ApiProperty } from '@nestjs/swagger';
import { DepartmentTypeResponseDto } from './department-type-response.dto';

export class DepartmentTypesListResponseDto {
    @ApiProperty({
        description: 'Danh sách loại khoa',
        type: [DepartmentTypeResponseDto],
    })
    departmentTypes: DepartmentTypeResponseDto[];

    @ApiProperty({
        description: 'Tổng số bản ghi',
        example: 10,
    })
    total: number;

    @ApiProperty({
        description: 'Số lượng bản ghi trên mỗi trang',
        example: 10,
    })
    limit: number;

    @ApiProperty({
        description: 'Vị trí bắt đầu',
        example: 0,
    })
    offset: number;
}
