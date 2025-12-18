import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WorkflowStateService } from '../services/workflow-state.service';
import { CreateWorkflowStateDto } from '../dto/commands/create-workflow-state.dto';
import { UpdateWorkflowStateDto } from '../dto/commands/update-workflow-state.dto';
import { GetWorkflowStatesDto } from '../dto/queries/get-workflow-states.dto';
import { WorkflowStateResponseDto, GetWorkflowStatesResult } from '../dto/responses/workflow-state-response.dto';
import { ResponseBuilder } from '../../../common/builders/response.builder';
import { DualAuthGuard } from '../../auth/guards/dual-auth.guard';
import { BadRequestException } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CurrentUser as ICurrentUser } from '../../../common/interfaces/current-user.interface';

@ApiTags('Workflow States')
@Controller('workflow-states')
@UseGuards(DualAuthGuard)
@ApiBearerAuth('JWT-auth')
export class WorkflowStateController {
    constructor(private readonly workflowStateService: WorkflowStateService) { }

    // ========== COMMANDS (Write Operations) ==========

    @Post()
    @ApiOperation({ summary: 'Tạo workflow state mới' })
    @ApiResponse({ status: 201, description: 'Tạo thành công' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: 409, description: 'Mã trạng thái đã tồn tại' })
    async createWorkflowState(
        @Body() createDto: CreateWorkflowStateDto,
        @CurrentUser() currentUser: ICurrentUser | null
    ) {
        if (!currentUser) {
            throw new BadRequestException('JWT authentication required for creating workflow states. HIS token is not supported for write operations.');
        }
        const id = await this.workflowStateService.create(createDto, currentUser);
        return ResponseBuilder.success({ id }, 201);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật workflow state' })
    @ApiParam({ name: 'id', description: 'ID của workflow state' })
    @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy workflow state' })
    async updateWorkflowState(
        @Param('id') id: string,
        @Body() updateDto: UpdateWorkflowStateDto,
        @CurrentUser() currentUser: ICurrentUser | null
    ) {
        if (!currentUser) {
            throw new BadRequestException('JWT authentication required for updating workflow states. HIS token is not supported for write operations.');
        }
        await this.workflowStateService.update(id, updateDto, currentUser);
        return ResponseBuilder.success({ message: 'Workflow state updated successfully' });
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa workflow state' })
    @ApiParam({ name: 'id', description: 'ID của workflow state' })
    @ApiResponse({ status: 200, description: 'Xóa thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy workflow state' })
    async deleteWorkflowState(@Param('id') id: string) {
        await this.workflowStateService.delete(id);
        return ResponseBuilder.success({ message: 'Workflow state deleted successfully' });
    }

    // ========== QUERIES (Read Operations) ==========

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách workflow states' })
    @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
    async getWorkflowStates(@Query() query: GetWorkflowStatesDto) {
        const result = await this.workflowStateService.getAll(query);
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

    @Get('first')
    @ApiOperation({ summary: 'Lấy trạng thái đầu tiên trong workflow' })
    @ApiResponse({ status: 200, description: 'Lấy thành công', type: WorkflowStateResponseDto })
    async getFirstState() {
        const result = await this.workflowStateService.getFirstState();
        if (!result) {
            return ResponseBuilder.success(null, 404);
        }
        return ResponseBuilder.success(result);
    }

    @Get('last')
    @ApiOperation({ summary: 'Lấy trạng thái cuối cùng trong workflow' })
    @ApiResponse({ status: 200, description: 'Lấy thành công', type: WorkflowStateResponseDto })
    async getLastState() {
        const result = await this.workflowStateService.getLastState();
        if (!result) {
            return ResponseBuilder.success(null, 404);
        }
        return ResponseBuilder.success(result);
    }

    @Get('code/:code')
    @ApiOperation({ summary: 'Lấy workflow state theo mã' })
    @ApiParam({ name: 'code', description: 'Mã trạng thái' })
    @ApiResponse({ status: 200, description: 'Lấy thành công', type: WorkflowStateResponseDto })
    @ApiResponse({ status: 404, description: 'Không tìm thấy workflow state' })
    async getWorkflowStateByCode(@Param('code') code: string) {
        const result = await this.workflowStateService.getByCode(code);
        return ResponseBuilder.success(result);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy workflow state theo ID' })
    @ApiParam({ name: 'id', description: 'ID của workflow state' })
    @ApiResponse({ status: 200, description: 'Lấy thành công', type: WorkflowStateResponseDto })
    @ApiResponse({ status: 404, description: 'Không tìm thấy workflow state' })
    async getWorkflowStateById(@Param('id') id: string) {
        const result = await this.workflowStateService.getById(id);
        return ResponseBuilder.success(result);
    }
}

