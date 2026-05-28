import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { DualAuthGuard } from '../../auth/guards/dual-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ResponseBuilder } from '../../../common/builders/response.builder';
import { CurrentUser as ICurrentUser } from '../../../common/interfaces/current-user.interface';
import { ServiceRequestAuditLogService } from '../services/service-request-audit-log.service';
import { GetAuditLogsDto } from '../dto/queries/get-audit-logs.dto';
import { AuditLogResponseDto, LatestResultSaveAuditDto } from '../dto/responses/audit-log-response.dto';

@ApiTags('Service Request Audit Logs')
@ApiBearerAuth('JWT-auth')
@Controller('service-request-audit-logs')
@UseGuards(DualAuthGuard)
export class ServiceRequestAuditLogController {
    constructor(private readonly auditLogService: ServiceRequestAuditLogService) {}

    @Get()
    @ApiOperation({ summary: 'Danh sách nhật ký tác động phiếu' })
    @ApiResponse({ status: 200 })
    async getList(
        @Query() query: GetAuditLogsDto,
        @CurrentUser() currentUser: ICurrentUser | null,
    ) {
        const result = await this.auditLogService.getList(query, currentUser);
        return ResponseBuilder.success({
            items: result.items,
            pagination: {
                total: result.total,
                limit: result.limit,
                offset: result.offset,
                hasNext: result.offset + result.limit < result.total,
                hasPrev: result.offset > 0,
            },
        });
    }

    @Get('latest-result-save')
    @ApiOperation({ summary: 'Người lưu kết quả lần cuối theo dịch vụ (Form Gen-1)' })
    @ApiResponse({ status: 200, type: LatestResultSaveAuditDto })
    async getLatestResultSave(@Query('storedServiceId') storedServiceId: string) {
        if (!storedServiceId?.trim()) {
            return ResponseBuilder.success(null);
        }
        const data = await this.auditLogService.getLatestResultSave(storedServiceId.trim());
        return ResponseBuilder.success(data);
    }

    @Get('export')
    @ApiOperation({ summary: 'Xuất Excel nhật ký theo filter' })
    @ApiProduces('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    async export(
        @Query() query: GetAuditLogsDto,
        @CurrentUser() currentUser: ICurrentUser | null,
        @Res() res: Response,
    ): Promise<void> {
        await this.auditLogService.exportExcel(query, currentUser, res);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Chi tiết một dòng nhật ký' })
    @ApiResponse({ status: 200, type: AuditLogResponseDto })
    async getById(@Param('id') id: string) {
        const data = await this.auditLogService.getById(id);
        return ResponseBuilder.success(data);
    }
}
