import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WorkflowHistoryService } from '../services/workflow-history.service';
import { StartWorkflowDto } from '../dto/commands/start-workflow.dto';
import { TransitionStateDto } from '../dto/commands/transition-state.dto';
import { UpdateCurrentStateDto } from '../dto/commands/update-current-state.dto';
import { DeleteByStateAndRequestDto } from '../dto/commands/delete-by-state-and-request.dto';
import { GetWorkflowHistoryDto } from '../dto/queries/get-workflow-history.dto';
import { GetWorkflowHistoryByRoomStateDto } from '../dto/queries/get-workflow-history-by-room-state.dto';
import { WorkflowHistoryResponseDto } from '../dto/responses/workflow-history-response.dto';
import { WorkflowHistoryActionInfoResponseDto } from '../dto/responses/workflow-history-action-info-response.dto';
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

    @Delete('by-state-and-request')
    @ApiOperation({ 
        summary: 'Xóa workflow history theo toStateId và storedServiceReqId',
        description: 'Xóa workflow history dựa trên toStateId và storedServiceReqId. Tìm workflow history theo toStateId và storedServiceReqId, sau đó xóa hoàn toàn (hard delete).'
    })
    @ApiQuery({ name: 'toStateId', description: 'ID của workflow state (toStateId)', example: '426df256-bbfa-28d1-e065-9e6b783dd008', required: true })
    @ApiQuery({ name: 'storedServiceReqId', description: 'ID của stored service request', example: 'abc-123-def-456', required: true })
    @ApiResponse({ status: 200, description: 'Xóa thành công' })
    @ApiResponse({ status: 400, description: 'Không thể xóa vì documentId không null hoặc resultText không null, hoặc thiếu query params' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy workflow history với toStateId và storedServiceReqId này' })
    async deleteByStateAndRequest(
        @Query() query: DeleteByStateAndRequestDto,
        @CurrentUser() currentUser: ICurrentUser | null
    ) {
        if (!currentUser) {
            throw new BadRequestException('JWT authentication required for deleting workflow history. HIS token is not supported for write operations.');
        }
        await this.workflowHistoryService.deleteByStateAndRequest(
            query.toStateId,
            query.storedServiceReqId,
            currentUser
        );
        return ResponseBuilder.success({ 
            message: 'Workflow history đã được xóa hoàn toàn',
            toStateId: query.toStateId,
            storedServiceReqId: query.storedServiceReqId
        });
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa hoàn toàn workflow history' })
    @ApiParam({ name: 'id', description: 'ID của workflow history' })
    @ApiResponse({ status: 200, description: 'Xóa thành công' })
    @ApiResponse({ status: 400, description: 'Không thể xóa vì documentId không null hoặc resultText không null' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy workflow history' })
    async deleteWorkflowHistory(
        @Param('id') id: string,
        @CurrentUser() currentUser: ICurrentUser | null
    ) {
        if (!currentUser) {
            throw new BadRequestException('JWT authentication required for deleting workflow history. HIS token is not supported for write operations.');
        }
        await this.workflowHistoryService.deleteWorkflowHistory(id, currentUser);
        return ResponseBuilder.success({ message: 'Workflow history đã được xóa hoàn toàn' });
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
            - Room ID: Để trống để lấy tất cả phòng
            - Room Type: actionRoomId, currentRoomId, transitionedByRoomId
            - State Type: toStateId, fromStateId
            - State ID: Để trống hoặc chuỗi rỗng để lấy tất cả states
            - Time Type: actionTimestamp, startedAt, completedAt, currentStateStartedAt
            - Time Range: fromDate, toDate (ISO format)
            - Current State: isCurrent (0 hoặc 1)
            - Code: Mã tìm kiếm - có thể là HIS Service Request Code hoặc Reception Code (tìm trong cả 2 trường)
            - Flag: Flag của stored service request (để trống để lấy tất cả, null để lấy các request không có flag)
            - Patient Name: Tên bệnh nhân (partial match, để trống để lấy tất cả)
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
                roomId: query.roomId || 'all',
                stateId: query.stateId || 'all',
                roomType: query.roomType || 'currentRoomId',
                stateType: query.stateType || 'toStateId',
                timeType: query.timeType || 'actionTimestamp',
                fromDate: query.fromDate,
                toDate: query.toDate,
                isCurrent: query.isCurrent,
                code: query.code || 'all',
                flag: query.flag !== undefined ? query.flag : 'all',
                patientName: query.patientName || 'all',
            },
        });
    }

    @Get('by-state-and-service-req/:stateId/:storedServiceReqId')
    @ApiOperation({ 
        summary: 'Lấy workflow history theo State ID và StoredServiceReqId',
        description: 'Lấy workflow history theo workflow state id và stored service request id. Response tương tự như GET /api/v1/workflow-history/{id} với đầy đủ thông tin creator.'
    })
    @ApiParam({ 
        name: 'stateId', 
        description: 'ID của workflow state',
        example: '426df256-bbfa-28d1-e065-9e6b783dd008'
    })
    @ApiParam({ 
        name: 'storedServiceReqId', 
        description: 'ID của stored service request',
        example: 'abc-123-def-456'
    })
    @ApiQuery({ 
        name: 'stateType', 
        description: 'Loại state để filter: toStateId hoặc fromStateId',
        enum: ['toStateId', 'fromStateId'],
        required: false,
        example: 'toStateId'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Lấy thành công', 
        type: WorkflowHistoryResponseDto 
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Không tìm thấy workflow history với stateId và storedServiceReqId này' 
    })
    async getByStateIdAndStoredServiceReqId(
        @Param('stateId') stateId: string,
        @Param('storedServiceReqId') storedServiceReqId: string,
        @Query('stateType') stateType?: 'toStateId' | 'fromStateId'
    ) {
        const result = await this.workflowHistoryService.getByStateIdAndStoredServiceReqId(
            stateId,
            storedServiceReqId,
            stateType || 'toStateId'
        );
        return ResponseBuilder.success(result);
    }

    @Get('action-info/:storedServiceReqId')
    @ApiOperation({
        summary: 'Lấy danh sách action info theo storedServiceReqId',
        description: 'Tham số: storedServiceReqId. Trả về danh sách các bản ghi với actionUsername, actionUserFullName và createdAt.',
    })
    @ApiParam({ name: 'storedServiceReqId', description: 'ID của stored service request' })
    @ApiResponse({ status: 200, description: 'Lấy thành công', type: [WorkflowHistoryActionInfoResponseDto] })
    async getActionInfoByStoredServiceReqId(@Param('storedServiceReqId') storedServiceReqId: string) {
        const result = await this.workflowHistoryService.getActionInfoByStoredServiceReqId(storedServiceReqId);
        return ResponseBuilder.success(result);
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
