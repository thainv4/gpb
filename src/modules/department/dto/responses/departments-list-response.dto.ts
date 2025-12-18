import { ApiProperty } from '@nestjs/swagger';
import { DepartmentResponseDto } from './department-response.dto';

export class DepartmentsListResponseDto {
    @ApiProperty({ type: [DepartmentResponseDto], description: 'Danh sách các khoa' })
    departments: DepartmentResponseDto[];

    @ApiProperty({ description: 'Tổng số khoa', example: 100 })
    total: number;

    @ApiProperty({ description: 'Số lượng khoa trên mỗi trang', example: 10 })
    limit: number;

    @ApiProperty({ description: 'Số lượng khoa đã bỏ qua', example: 0 })
    offset: number;
}
