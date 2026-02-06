import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Response DTO cho GET workflow-history theo storedServiceReqId
 */
export class WorkflowHistoryActionInfoResponseDto {
    @ApiPropertyOptional({ description: 'Tên user thực hiện action (ACTION_USERNAME)' })
    actionUsername?: string | null;

    @ApiPropertyOptional({ description: 'Họ tên đầy đủ của user (FULL_NAME từ bảng BML_USERS)' })
    actionUserFullName?: string | null;

    @ApiPropertyOptional({ description: 'Tên trạng thái workflow (STATE_NAME từ bảng BML_WORKFLOW_STATES)' })
    stateName?: string | null;

    @ApiPropertyOptional({ description: 'Thứ tự trạng thái (STATE_ORDER từ bảng BML_WORKFLOW_STATES)' })
    stateOrder?: number | null;

    @ApiProperty({ description: 'Thời gian tạo bản ghi (CREATED_AT)' })
    createdAt: Date;
}
