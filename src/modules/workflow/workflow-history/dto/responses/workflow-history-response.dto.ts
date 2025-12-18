import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponseDto } from '../../../../../common/dto/base-response.dto';
import { ServiceRequestSummaryDto } from './service-request-summary.dto';

export class WorkflowHistoryResponseDto extends BaseResponseDto {
    @ApiProperty({ description: 'ID của Service Request' })
    storedServiceReqId: string;

    @ApiPropertyOptional({ description: 'ID của Service cụ thể' })
    storedServiceId?: string | null;

    @ApiPropertyOptional({ description: 'ID trạng thái từ' })
    fromStateId?: string | null;

    @ApiProperty({ description: 'ID trạng thái đến' })
    toStateId: string;

    @ApiPropertyOptional({ description: 'ID trạng thái trước đó (chỉ khi IS_CURRENT = 1)' })
    previousStateId?: string | null;

    @ApiProperty({ description: 'Thời gian bắt đầu workflow' })
    startedAt: Date;

    @ApiProperty({ description: 'Thời điểm thực hiện action' })
    actionTimestamp: Date;

    @ApiPropertyOptional({ description: 'Thời gian bắt đầu trạng thái hiện tại (chỉ khi IS_CURRENT = 1)' })
    currentStateStartedAt?: Date | null;

    @ApiPropertyOptional({ description: 'Thời gian hoàn thành workflow (chỉ khi IS_CURRENT = 1)' })
    completedAt?: Date | null;

    @ApiPropertyOptional({ description: 'Thời gian dự kiến hoàn thành (chỉ khi IS_CURRENT = 1)' })
    estimatedCompletionTime?: Date | null;

    @ApiPropertyOptional({ description: 'Thời gian xử lý (phút)' })
    durationMinutes?: number | null;

    @ApiProperty({ description: 'Loại action', enum: ['START', 'COMPLETE', 'SKIP', 'ROLLBACK', 'PAUSE', 'RESUME'] })
    actionType: string;

    @ApiProperty({ description: 'ID user thực hiện action' })
    actionUserId: string;

    @ApiPropertyOptional({ description: 'Tên user (denormalized)' })
    actionUsername?: string | null;

    @ApiPropertyOptional({ description: 'ID department thực hiện action' })
    actionDepartmentId?: string | null;

    @ApiPropertyOptional({ description: 'ID room thực hiện action' })
    actionRoomId?: string | null;

    @ApiPropertyOptional({ description: 'ID user đang xử lý (chỉ khi IS_CURRENT = 1)' })
    currentUserId?: string | null;

    @ApiPropertyOptional({ description: 'ID department đang xử lý (chỉ khi IS_CURRENT = 1)' })
    currentDepartmentId?: string | null;

    @ApiPropertyOptional({ description: 'ID room đang xử lý (chỉ khi IS_CURRENT = 1)' })
    currentRoomId?: string | null;

    @ApiPropertyOptional({ description: 'ID user đã chuyển workflow (chỉ khi IS_CURRENT = 1)' })
    transitionedByUserId?: string | null;

    @ApiPropertyOptional({ description: 'ID department đã chuyển workflow (chỉ khi IS_CURRENT = 1)' })
    transitionedByDepartmentId?: string | null;

    @ApiPropertyOptional({ description: 'ID room đã chuyển workflow (chỉ khi IS_CURRENT = 1)' })
    transitionedByRoomId?: string | null;

    @ApiProperty({ description: '1 = current state, 0 = history' })
    isCurrent: number;

    @ApiProperty({ description: 'Workflow đang active (chỉ khi IS_CURRENT = 1)' })
    isActive: number;

    @ApiProperty({ description: 'Workflow đã hoàn thành (chỉ khi IS_CURRENT = 1)' })
    isCompleted: number;

    @ApiPropertyOptional({ description: 'Ghi chú' })
    notes?: string | null;

    @ApiPropertyOptional({ description: 'Link file đính kèm' })
    attachmentUrl?: string | null;

    @ApiPropertyOptional({ description: 'JSON metadata' })
    metadata?: string | null;

    // ========== NESTED INFO ==========

    @ApiPropertyOptional({ description: 'Thông tin Service Request', type: ServiceRequestSummaryDto })
    serviceRequest?: ServiceRequestSummaryDto;

    @ApiPropertyOptional({ description: 'Thông tin State (nested)', type: Object })
    toState?: {
        id: string;
        stateCode: string;
        stateName: string;
        sortOrder: number;
    };

    @ApiPropertyOptional({ description: 'Thông tin From State (nested)', type: Object })
    fromState?: {
        id: string;
        stateCode: string;
        stateName: string;
        sortOrder: number;
    };
}

export interface GetWorkflowHistoryResult {
    items: WorkflowHistoryResponseDto[];
    total: number;
    limit: number;
    offset: number;
}

