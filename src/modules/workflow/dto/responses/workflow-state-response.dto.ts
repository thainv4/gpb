import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponseDto } from '../../../../common/dto/base-response.dto';

export class WorkflowStateResponseDto extends BaseResponseDto {
    @ApiProperty({ description: 'Mã trạng thái', example: 'SAMPLE_COLLECTION' })
    stateCode: string;

    @ApiProperty({ description: 'Tên trạng thái', example: 'Lấy mẫu' })
    stateName: string;

    @ApiPropertyOptional({ description: 'Mô tả chi tiết', example: 'Bước lấy mẫu từ bệnh nhân' })
    stateDescription?: string;

    @ApiProperty({ description: 'Thứ tự trong workflow', example: 1 })
    stateOrder: number;

    @ApiProperty({ description: 'Có thể bỏ qua không', example: 0 })
    canSkip: number;

    @ApiProperty({ description: 'Cần phê duyệt không', example: 0 })
    requiresApproval: number;

    @ApiProperty({ description: 'Trạng thái active/inactive', example: 1 })
    isActive: number;
}

export interface GetWorkflowStatesResult {
    items: WorkflowStateResponseDto[];
    total: number;
    limit: number;
    offset: number;
}

