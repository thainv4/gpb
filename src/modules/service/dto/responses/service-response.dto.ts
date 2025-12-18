import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponseDto } from '../../../../common/dto/base-response.dto';

export class ServiceResponseDto extends BaseResponseDto {
    @ApiProperty({ description: 'Mã dịch vụ', example: 'SVC001' })
    serviceCode: string;

    @ApiProperty({ description: 'Tên dịch vụ', example: 'Xét nghiệm máu tổng quát' })
    serviceName: string;

    @ApiPropertyOptional({ description: 'Tên viết tắt', example: 'XNMTQ' })
    shortName?: string;

    @ApiProperty({ description: 'ID nhóm dịch vụ' })
    serviceGroupId: string;

    @ApiPropertyOptional({ description: 'Tên nhóm dịch vụ' })
    serviceGroupName?: string;

    @ApiPropertyOptional({ description: 'ID đơn vị tính' })
    unitOfMeasureId?: string;

    @ApiPropertyOptional({ description: 'Tên đơn vị tính' })
    unitOfMeasureName?: string;

    @ApiPropertyOptional({ description: 'Mapping JSON' })
    mapping?: string;

    @ApiProperty({ description: 'Thứ tự sắp xếp', example: 1 })
    numOrder: number;

    @ApiProperty({ description: 'Giá hiện tại', example: 150000 })
    currentPrice: number;

    @ApiPropertyOptional({ description: 'ID dịch vụ cha' })
    parentServiceId?: string;

    @ApiPropertyOptional({ description: 'Tên dịch vụ cha' })
    parentServiceName?: string;

    @ApiPropertyOptional({ description: 'Mô tả chi tiết' })
    description?: string;

    @ApiProperty({ description: 'Trạng thái hoạt động', example: true })
    isActive: boolean;

    @ApiProperty({ description: 'Cấp độ phân cấp', example: 0 })
    hierarchyLevel: number;

    @ApiProperty({ description: 'Có phải dịch vụ con không', example: false })
    isSubService: boolean;

    @ApiProperty({ description: 'Tên đầy đủ (bao gồm cha)', example: 'Xét nghiệm máu tổng quát' })
    fullServiceName: string;

    @ApiProperty({ description: 'Có dịch vụ con không', example: true })
    hasChildren: boolean;

    @ApiProperty({ description: 'Số lượng dịch vụ con', example: 2 })
    childrenCount: number;

    @ApiProperty({ description: 'Tổng giá trị (bao gồm con)', example: 280000 })
    totalPrice: number;
}
