import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WorkflowHistoryService } from '../services/workflow-history.service';
import { StartWorkflowDto } from '../dto/commands/start-workflow.dto';
import { TransitionStateDto } from '../dto/commands/transition-state.dto';
import { UpdateCurrentStateDto } from '../dto/commands/update-current-state.dto';
import { GetWorkflowHistoryDto } from '../dto/queries/get-workflow-history.dto';
import { GetWorkflowHistoryByRoomStateDto } from '../dto/queries/get-workflow-history-by-room-state.dto';
import { WorkflowHistoryResponseDto, GetWorkflowHistoryResult } from '../dto/responses/workflow-history-response.dto';
import { ResponseBuilder } from '../../../../common/builders/response.builder';
import { DualAuthGuard } from '../../../auth/guards/dual-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { CurrentUser as ICurrentUser } from '../../../../common/interfaces/current-user.interface';

@ApiTags('Workflow History')
@Controller('workflow-history')
@UseGuards(DualAuthGuard)
@ApiBearerAuth('JWT-auth')
export class WorkflowHistoryController {
    constructor(private readonly workflowHistoryService: WorkflowHistoryService) { }

    // ========== COMMANDS (Write Operations) ==========

    @Post('start')
    @ApiOperation({ summary: 'Bắt đầu workflow mới' })
    @ApiResponse({ status: 201, description: 'Tạo workflow thành công' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: 409, description: 'Workflow đã được khởi tạo' })
    async startWorkflow(
        @Body() dto: StartWorkflowDto,
        @CurrentUser() currentUser: ICurrentUser | null
    ) {
        if (!currentUser) {
            throw new BadRequestException('JWT authentication required for starting workflows. HIS token is not supported for write operations.');
        }
        const id = await this.workflowHistoryService.startWorkflow(dto, currentUser);
        return ResponseBuilder.success({ id }, 201);
    }

    @Post('transition')
    @ApiOperation({ summary: 'Chuyển workflow sang state mới' })
    @ApiResponse({ status: 201, description: 'Chuyển state thành công' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy workflow' })
    async transitionState(
        @Body() dto: TransitionStateDto,
        @CurrentUser() currentUser: ICurrentUser | null
    ) {
        if (!currentUser) {
            throw new BadRequestException('JWT authentication required for workflow transitions. HIS token is not supported for write operations.');
        }
        const id = await this.workflowHistoryService.transitionState(dto, currentUser);
        return ResponseBuilder.success({ id }, 201);
    }

    @Put('current/:storedServiceReqId')
    @ApiOperation({ summary: 'Cập nhật thông tin current state' })
    @ApiParam({ name: 'storedServiceReqId', description: 'ID của Service Request' })
    @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy workflow' })
    async updateCurrentState(
        @Param('storedServiceReqId') storedServiceReqId: string,
        @Query('storedServiceId') storedServiceId: string | undefined,
        @Body() dto: UpdateCurrentStateDto,
        @CurrentUser() currentUser: ICurrentUser | null
    ) {
        if (!currentUser) {
            throw new BadRequestException('JWT authentication required for updating workflow states. HIS token is not supported for write operations.');
        }
        await this.workflowHistoryService.updateCurrentState(
            storedServiceReqId,
            storedServiceId || null,
            dto,
            currentUser
        );
        return ResponseBuilder.success({ message: 'Current state updated successfully' });
    }

    // ========== QUERIES (Read Operations) ==========

    @Get('current/:storedServiceReqId')
    @ApiOperation({ summary: 'Lấy current state của workflow' })
    @ApiParam({ name: 'storedServiceReqId', description: 'ID của Service Request' })
    @ApiResponse({ status: 200, description: 'Lấy thành công', type: WorkflowHistoryResponseDto })
    @ApiResponse({ status: 404, description: 'Không tìm thấy workflow' })
    async getCurrentState(
        @Param('storedServiceReqId') storedServiceReqId: string,
        @Query('storedServiceId') storedServiceId: string | undefined
    ) {
        const result = await this.workflowHistoryService.getCurrentState(
            storedServiceReqId,
            storedServiceId || null
        );
        return ResponseBuilder.success(result);
    }

    @Get('current/all/:storedServiceReqId')
    @ApiOperation({ summary: 'Lấy tất cả current states của một Service Request' })
    @ApiParam({ name: 'storedServiceReqId', description: 'ID của Service Request' })
    @ApiResponse({ status: 200, description: 'Lấy thành công' })
    async getCurrentStatesByServiceReq(
        @Param('storedServiceReqId') storedServiceReqId: string
    ) {
        const result = await this.workflowHistoryService.getCurrentStatesByServiceReq(storedServiceReqId);
        return ResponseBuilder.success(result);
    }

    @Get('history/:storedServiceReqId')
    @ApiOperation({ summary: 'Lấy lịch sử workflow' })
    @ApiParam({ name: 'storedServiceReqId', description: 'ID của Service Request' })
    @ApiResponse({ status: 200, description: 'Lấy thành công' })
    async getHistory(
        @Param('storedServiceReqId') storedServiceReqId: string,
        @Query('storedServiceId') storedServiceId: string | undefined
    ) {
        const result = await this.workflowHistoryService.getHistory(
            storedServiceReqId,
            storedServiceId || null
        );
        return ResponseBuilder.success(result);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách workflow history với filter' })
    @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
    async getAll(@Query() query: GetWorkflowHistoryDto) {
        const result = await this.workflowHistoryService.getAll(query);
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

    @Get('by-room-and-state')
    @ApiOperation({
        summary: 'Lấy danh sách workflow history theo Room ID và State ID',
        description: `
            Filter workflow history theo phòng và trạng thái với các tùy chọn:
            - Room Type: actionRoomId, currentRoomId, transitionedByRoomId
            - State Type: toStateId, fromStateId
            - State ID: Để trống hoặc chuỗi rỗng để lấy tất cả states
            - Time Type: actionTimestamp, startedAt, completedAt, currentStateStartedAt
            - Time Range: fromDate, toDate (ISO format)
            - Current State: isCurrent (0 hoặc 1)
            - Response bao gồm thông tin Service Request và State (nested)
        `
    })
    @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    async getByRoomAndState(@Query() query: GetWorkflowHistoryByRoomStateDto) {
        const result = await this.workflowHistoryService.getByRoomAndState(query);
        return ResponseBuilder.success({
            items: result.items,
            pagination: {
                total: result.total,
                limit: result.limit,
                offset: result.offset,
                hasNext: result.offset + result.limit < result.total,
                hasPrev: result.offset > 0,
            },
            filters: {
                roomId: query.roomId,
                stateId: query.stateId || 'all',
                roomType: query.roomType || 'currentRoomId',
                stateType: query.stateType || 'toStateId',
                timeType: query.timeType || 'actionTimestamp',
                fromDate: query.fromDate,
                toDate: query.toDate,
                isCurrent: query.isCurrent,
            },
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy workflow history theo ID' })
    @ApiParam({ name: 'id', description: 'ID của workflow history' })
    @ApiResponse({ status: 200, description: 'Lấy thành công', type: WorkflowHistoryResponseDto })
    @ApiResponse({ status: 404, description: 'Không tìm thấy workflow history' })
    async getById(@Param('id') id: string) {
        const result = await this.workflowHistoryService.getById(id);
        return ResponseBuilder.success(result);
    }
}
