import { Inject, Injectable } from '@nestjs/common';
import { IWorkflowHistoryRepository } from '../workflow/workflow-history/interfaces/workflow-history.repository.interface';
import { IStoredServiceRequestRepository } from '../service-request/interfaces/stored-service-request.repository.interface';
import { DashboardStateDistributionQueryDto } from './dto/queries/dashboard-state-distribution-query.dto';
import { DashboardCaseVolumeQueryDto } from './dto/queries/dashboard-case-volume-query.dto';
import {
    DashboardCaseVolumeResponseDto,
} from './dto/responses/dashboard-case-volume-response.dto';
import {
    DashboardStateDistributionResponseDto,
} from './dto/responses/dashboard-state-distribution-response.dto';

const DEFAULT_TREND_LOOKBACK_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class DashboardService {
    constructor(
        @Inject('IWorkflowHistoryRepository')
        private readonly workflowHistoryRepository: IWorkflowHistoryRepository,
        @Inject('IStoredServiceRequestRepository')
        private readonly storedServiceRequestRepository: IStoredServiceRequestRepository,
    ) {}

    async getWorkflowStateDistribution(
        query: DashboardStateDistributionQueryDto,
    ): Promise<DashboardStateDistributionResponseDto> {
        const filters: {
            fromCreatedAt?: Date;
            toCreatedAt?: Date;
            currentRoomId?: string;
            currentDepartmentId?: string;
        } = {};
        if (query.fromDate) {
            filters.fromCreatedAt = new Date(query.fromDate);
        }
        if (query.toDate) {
            filters.toCreatedAt = new Date(query.toDate);
        }
        if (query.currentRoomId) {
            filters.currentRoomId = query.currentRoomId;
        }
        if (query.currentDepartmentId) {
            filters.currentDepartmentId = query.currentDepartmentId;
        }

        const items = await this.workflowHistoryRepository.getDashboardStateDistribution(filters);

        const totalCases = items.reduce((sum, row) => sum + row.count, 0);

        return {
            fromDate: query.fromDate ?? null,
            toDate: query.toDate ?? null,
            currentRoomId: query.currentRoomId ?? null,
            currentDepartmentId: query.currentDepartmentId ?? null,
            items,
            totalCases,
        };
    }

    async getCaseVolume(query: DashboardCaseVolumeQueryDto): Promise<DashboardCaseVolumeResponseDto> {
        const granularity = query.granularity ?? 'day';
        const toDate = query.toDate ? new Date(query.toDate) : new Date();
        const fromDate = query.fromDate
            ? new Date(query.fromDate)
            : new Date(toDate.getTime() - DEFAULT_TREND_LOOKBACK_MS);

        const series = await this.storedServiceRequestRepository.getStoredServiceRequestTrend({
            granularity,
            fromDate,
            toDate,
            currentRoomId: query.currentRoomId,
            currentDepartmentId: query.currentDepartmentId,
        });

        const total = series.reduce((sum, row) => sum + row.count, 0);

        return {
            granularity,
            fromDate: fromDate.toISOString(),
            toDate: toDate.toISOString(),
            series,
            total,
        };
    }
}
