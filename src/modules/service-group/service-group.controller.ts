import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ServiceGroupService } from './service-group.service';
import { CreateServiceGroupDto } from './dto/commands/create-service-group.dto';
import { UpdateServiceGroupDto } from './dto/commands/update-service-group.dto';
import { GetServiceGroupsDto } from './dto/queries/get-service-groups.dto';
import { SearchServiceGroupsDto } from './dto/queries/search-service-groups.dto';
import { ServiceGroupResponseDto } from './dto/responses/service-group-response.dto';
import { GetServiceGroupsResult } from './dto/responses/service-groups-list-response.dto';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser as ICurrentUser } from '../../common/interfaces/current-user.interface';

@ApiTags('Service Groups')
@Controller('service-groups')
@UseGuards(DualAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ServiceGroupController {
    constructor(private readonly serviceGroupService: ServiceGroupService) { }

    // ========== COMMANDS (Write Operations) ==========

    @Post()
    @ApiOperation({
        summary: 'Tạo nhóm dịch vụ mới',
        description: 'Tạo một nhóm dịch vụ mới trong hệ thống'
    })
    @ApiResponse({ status: 201, description: 'Nhóm dịch vụ được tạo thành công' })
    @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
    @ApiResponse({ status: 409, description: 'Mã nhóm dịch vụ đã tồn tại' })
    async createServiceGroup(
        @Body() createDto: CreateServiceGroupDto,
        @CurrentUser() currentUser: ICurrentUser
    ) {
        const id = await this.serviceGroupService.createServiceGroup(createDto, currentUser);
        return ResponseBuilder.success({ id }, 201);
    }

    @Put(':id')
    @ApiOperation({
        summary: 'Cập nhật nhóm dịch vụ',
        description: 'Cập nhật thông tin nhóm dịch vụ theo ID'
    })
    @ApiParam({ name: 'id', description: 'ID của nhóm dịch vụ' })
    @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy nhóm dịch vụ' })
    async updateServiceGroup(
        @Param('id') id: string,
        @Body() updateDto: UpdateServiceGroupDto,
        @CurrentUser() currentUser: ICurrentUser
    ) {
        await this.serviceGroupService.updateServiceGroup(id, updateDto, currentUser);
        return ResponseBuilder.success({ message: 'Service group updated successfully' });
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Xóa nhóm dịch vụ',
        description: 'Xóa nhóm dịch vụ theo ID (soft delete)'
    })
    @ApiParam({ name: 'id', description: 'ID của nhóm dịch vụ' })
    @ApiResponse({ status: 200, description: 'Xóa thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy nhóm dịch vụ' })
    async deleteServiceGroup(@Param('id') id: string) {
        await this.serviceGroupService.deleteServiceGroup(id);
        return ResponseBuilder.success({ message: 'Service group deleted successfully' });
    }

    @Patch(':id/activate')
    @ApiOperation({
        summary: 'Kích hoạt nhóm dịch vụ',
        description: 'Kích hoạt nhóm dịch vụ theo ID'
    })
    @ApiParam({ name: 'id', description: 'ID của nhóm dịch vụ' })
    @ApiResponse({ status: 200, description: 'Kích hoạt thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy nhóm dịch vụ' })
    async activateServiceGroup(
        @Param('id') id: string,
        @CurrentUser() currentUser: ICurrentUser
    ) {
        await this.serviceGroupService.activateServiceGroup(id, currentUser);
        return ResponseBuilder.success({ message: 'Service group activated successfully' });
    }

    @Patch(':id/deactivate')
    @ApiOperation({
        summary: 'Vô hiệu hóa nhóm dịch vụ',
        description: 'Vô hiệu hóa nhóm dịch vụ theo ID'
    })
    @ApiParam({ name: 'id', description: 'ID của nhóm dịch vụ' })
    @ApiResponse({ status: 200, description: 'Vô hiệu hóa thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy nhóm dịch vụ' })
    async deactivateServiceGroup(
        @Param('id') id: string,
        @CurrentUser() currentUser: ICurrentUser
    ) {
        await this.serviceGroupService.deactivateServiceGroup(id, currentUser);
        return ResponseBuilder.success({ message: 'Service group deactivated successfully' });
    }

    // ========== QUERIES (Read Operations) ==========

    @Get()
    @ApiOperation({
        summary: 'Lấy danh sách nhóm dịch vụ',
        description: 'Lấy danh sách nhóm dịch vụ với phân trang và tìm kiếm'
    })
    @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
    async getServiceGroups(@Query() query: GetServiceGroupsDto) {
        const result = await this.serviceGroupService.getServiceGroups(query);
        return ResponseBuilder.success(result);
    }

    @Get('search')
    @ApiOperation({
        summary: 'Tìm kiếm nhóm dịch vụ',
        description: 'Tìm kiếm nhóm dịch vụ theo từ khóa và bộ lọc'
    })
    @ApiResponse({ status: 200, description: 'Tìm kiếm thành công', type: [ServiceGroupResponseDto] })
    async searchServiceGroups(@Query() query: SearchServiceGroupsDto) {
        const result = await this.serviceGroupService.searchServiceGroups(query);
        return ResponseBuilder.success(result);
    }

    @Get('active')
    @ApiOperation({
        summary: 'Lấy danh sách nhóm dịch vụ đang hoạt động',
        description: 'Lấy danh sách các nhóm dịch vụ đang hoạt động'
    })
    @ApiResponse({ status: 200, description: 'Lấy danh sách thành công', type: [ServiceGroupResponseDto] })
    async getActiveServiceGroups() {
        const result = await this.serviceGroupService.getActiveServiceGroups();
        return ResponseBuilder.success(result);
    }

    @Get('mapping/:mapping')
    @ApiOperation({
        summary: 'Lấy nhóm dịch vụ theo mapping',
        description: 'Lấy danh sách nhóm dịch vụ theo mapping với hệ thống khác'
    })
    @ApiParam({ name: 'mapping', description: 'Mapping string để tìm kiếm' })
    @ApiResponse({ status: 200, description: 'Lấy danh sách thành công', type: [ServiceGroupResponseDto] })
    async getServiceGroupsByMapping(@Param('mapping') mapping: string) {
        const result = await this.serviceGroupService.getServiceGroupsByMapping(mapping);
        return ResponseBuilder.success(result);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Lấy thông tin nhóm dịch vụ',
        description: 'Lấy thông tin chi tiết nhóm dịch vụ theo ID'
    })
    @ApiParam({ name: 'id', description: 'ID của nhóm dịch vụ' })
    @ApiResponse({ status: 200, description: 'Lấy thông tin thành công', type: ServiceGroupResponseDto })
    @ApiResponse({ status: 404, description: 'Không tìm thấy nhóm dịch vụ' })
    async getServiceGroupById(@Param('id') id: string) {
        const result = await this.serviceGroupService.getServiceGroupById(id);
        return ResponseBuilder.success(result);
    }

    @Get('code/:code')
    @ApiOperation({
        summary: 'Lấy nhóm dịch vụ theo mã',
        description: 'Lấy thông tin nhóm dịch vụ theo mã nhóm dịch vụ'
    })
    @ApiParam({ name: 'code', description: 'Mã nhóm dịch vụ' })
    @ApiResponse({ status: 200, description: 'Lấy thông tin thành công', type: ServiceGroupResponseDto })
    @ApiResponse({ status: 404, description: 'Không tìm thấy nhóm dịch vụ' })
    async getServiceGroupByCode(@Param('code') code: string) {
        const result = await this.serviceGroupService.getServiceGroupByCode(code);
        return ResponseBuilder.success(result);
    }
}
