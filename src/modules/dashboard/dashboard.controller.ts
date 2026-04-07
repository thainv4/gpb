import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardStateDistributionQueryDto } from './dto/queries/dashboard-state-distribution-query.dto';
import { DashboardCaseVolumeQueryDto } from './dto/queries/dashboard-case-volume-query.dto';
import { DashboardStateDistributionResponseDto } from './dto/responses/dashboard-state-distribution-response.dto';
import { DashboardCaseVolumeResponseDto } from './dto/responses/dashboard-case-volume-response.dto';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(DualAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('workflow-state-distribution')
    @ApiOperation({
        summary: 'Phân bổ số ca theo state workflow hiện tại',
        description:
            'Với mỗi stored service request, lấy các bản ghi workflow IS_CURRENT = 1, chọn nhánh có STATE_ORDER lớn nhất (tie-break ACTION_TIMESTAMP). Có thể lọc SR theo CREATED_AT, CURRENT_ROOM_ID, CURRENT_DEPARTMENT_ID.',
    })
    @ApiResponse({ status: 200, type: DashboardStateDistributionResponseDto })
    async getWorkflowStateDistribution(@Query() query: DashboardStateDistributionQueryDto) {
        const data = await this.dashboardService.getWorkflowStateDistribution(query);
        return ResponseBuilder.success(data);
    }

    @Get('case-volume')
    @ApiOperation({
        summary: 'Số stored service request theo ngày / tuần ISO / tháng',
        description:
            'Đếm theo CREATED_AT. Granularity: day (YYYY-MM-DD), week (IYYY-IW), month (YYYY-MM). Nếu không truyền fromDate, mặc định 30 ngày trước toDate.',
    })
    @ApiResponse({ status: 200, type: DashboardCaseVolumeResponseDto })
    async getCaseVolume(@Query() query: DashboardCaseVolumeQueryDto) {
        const data = await this.dashboardService.getCaseVolume(query);
        return ResponseBuilder.success(data);
    }
}
