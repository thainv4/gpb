import { ApiProperty } from '@nestjs/swagger';

export class DepartmentResponseDto {
    @ApiProperty({ description: 'ID của khoa', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
    id: string;

    @ApiProperty({ description: 'Mã khoa', example: 'KTM' })
    departmentCode: string;

    @ApiProperty({ description: 'Tên khoa', example: 'Khoa Tim Mạch' })
    departmentName: string;

    @ApiProperty({ description: 'Tên hiển thị của khoa', example: 'KTM - Khoa Tim Mạch' })
    displayName: string;

    @ApiProperty({ description: 'ID chi nhánh', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
    branchId: string;

    @ApiProperty({ description: 'Tên chi nhánh', example: 'Bệnh viện A', nullable: true })
    branchName?: string;

    @ApiProperty({ description: 'Trưởng khoa', example: 'BS. Nguyễn Văn A', nullable: true })
    headOfDepartment?: string;

    @ApiProperty({ description: 'Điều dưỡng trưởng', example: 'ĐD. Trần Thị B', nullable: true })
    headNurse?: string;

    @ApiProperty({ description: 'ID khoa cha', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', nullable: true })
    parentDepartmentId?: string;

    @ApiProperty({ description: 'Tên khoa cha', example: 'Khoa Nội', nullable: true })
    parentDepartmentName?: string;

    @ApiProperty({ description: 'Tên viết tắt', example: 'KTM', nullable: true })
    shortName?: string;

    @ApiProperty({ description: 'ID loại khoa', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
    departmentTypeId: string;

    @ApiProperty({ description: 'Tên loại khoa', example: 'Khoa', nullable: true })
    departmentTypeName?: string;

    @ApiProperty({ description: 'Thứ tự sắp xếp', example: 1 })
    sortOrder: number;

    @ApiProperty({ description: 'Trạng thái hoạt động', example: true })
    isActive: boolean;

    @ApiProperty({ description: 'Phiên bản của bản ghi', example: 1 })
    version: number;

    @ApiProperty({ description: 'Thời gian tạo', example: '2023-01-01T12:00:00Z' })
    createdAt: Date;

    @ApiProperty({ description: 'Thời gian cập nhật cuối cùng', example: '2023-01-01T12:00:00Z' })
    updatedAt: Date;

    @ApiProperty({ description: 'Cấp độ trong cây phân cấp', example: 0 })
    hierarchyLevel: number;

    @ApiProperty({ description: 'Có phải khoa gốc không', example: true })
    isRoot: boolean;

    @ApiProperty({ description: 'Có khoa con không', example: false })
    hasChildren: boolean;
}
