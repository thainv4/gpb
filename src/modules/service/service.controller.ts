import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/commands/create-service.dto';
import { UpdateServiceDto } from './dto/commands/update-service.dto';
import { DeleteServiceDto } from './dto/commands/delete-service.dto';
import { GetServicesDto } from './dto/queries/get-services.dto';
import { SearchServicesDto } from './dto/queries/search-services.dto';
import { ServiceResponseDto } from './dto/responses/service-response.dto';
import { ServiceWithChildrenResponseDto } from './dto/responses/service-with-children-response.dto';
import { ServiceHierarchyResponseDto } from './dto/responses/service-hierarchy-response.dto';
import { GetServicesResult } from './dto/responses/services-list-response.dto';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';
import { BadRequestException } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser as ICurrentUser } from '../../common/interfaces/current-user.interface';

@ApiTags('Services')
@Controller('services')
@UseGuards(DualAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ServiceController {
    constructor(private readonly serviceService: ServiceService) { }

    // ========== COMMANDS (Write Operations) ==========

    @Post()
    @HttpCode(201)
    @ApiOperation({
        summary: 'Tạo dịch vụ mới',
        description: 'Tạo một dịch vụ mới với các thông tin cơ bản'
    })
    @ApiResponse({ status: 201, description: 'Dịch vụ đã được tạo thành công' })
    @ApiBody({ type: CreateServiceDto })
    async createService(
        @Body() createServiceDto: CreateServiceDto,
        @CurrentUser() currentUser: ICurrentUser | null,
    ) {
        if (!currentUser) {
            throw new BadRequestException('JWT authentication required for creating services. HIS token is not supported for write operations.');
        }
        const serviceId = await this.serviceService.createService(createServiceDto, currentUser);
        return ResponseBuilder.success({ id: serviceId }, 201);
    }

    @Put(':id')
    @ApiOperation({
        summary: 'Cập nhật dịch vụ',
        description: 'Cập nhật thông tin của một dịch vụ'
    })
    @ApiResponse({ status: 200, description: 'Dịch vụ đã được cập nhật thành công' })
    @ApiParam({ name: 'id', description: 'ID của dịch vụ' })
    @ApiBody({ type: UpdateServiceDto })
    async updateService(
        @Param('id') id: string,
        @Body() updateServiceDto: UpdateServiceDto,
        @CurrentUser() currentUser: ICurrentUser | null,
    ) {
        if (!currentUser) {
            throw new BadRequestException('JWT authentication required for updating services. HIS token is not supported for write operations.');
        }
        await this.serviceService.updateService(id, updateServiceDto, currentUser);
        return ResponseBuilder.success({ message: 'Dịch vụ đã được cập nhật thành công' });
    }

    @Delete(':id')
    @HttpCode(204)
    @ApiOperation({
        summary: 'Xóa dịch vụ',
        description: 'Xóa mềm một dịch vụ (chỉ xóa được nếu không có dịch vụ con)'
    })
    @ApiResponse({ status: 204, description: 'Dịch vụ đã được xóa thành công' })
    @ApiParam({ name: 'id', description: 'ID của dịch vụ' })
    @ApiBody({ type: DeleteServiceDto })
    async deleteService(
        @Param('id') id: string,
        @Body() deleteServiceDto: DeleteServiceDto,
        @CurrentUser() currentUser: ICurrentUser | null,
    ) {
        if (!currentUser) {
            throw new BadRequestException('JWT authentication required for deleting services. HIS token is not supported for write operations.');
        }
        await this.serviceService.deleteService(id, currentUser);
        return ResponseBuilder.success({ message: 'Dịch vụ đã được xóa thành công' }, 204);
    }

    @Post('reorder')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Sắp xếp lại thứ tự dịch vụ',
        description: 'Sắp xếp lại thứ tự hiển thị của các dịch vụ'
    })
    @ApiResponse({ status: 200, description: 'Thứ tự dịch vụ đã được cập nhật thành công' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                serviceIds: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['service-1', 'service-2', 'service-3']
                }
            }
        }
    })
    async reorderServices(
        @Body() body: { serviceIds: string[] },
        @CurrentUser() currentUser: ICurrentUser | null,
    ) {
        if (!currentUser) {
            throw new BadRequestException('JWT authentication required for reordering services. HIS token is not supported for write operations.');
        }
        await this.serviceService.reorderServices(body.serviceIds, currentUser);
        return ResponseBuilder.success({ message: 'Thứ tự dịch vụ đã được cập nhật thành công' });
    }

    // ========== QUERIES (Read Operations) ==========

    @Get()
    @ApiOperation({
        summary: 'Lấy danh sách dịch vụ',
        description: 'Lấy danh sách dịch vụ với các bộ lọc và phân trang'
    })
    @ApiResponse({ status: 200, description: 'Danh sách dịch vụ' })
    @ApiQuery({ name: 'serviceGroupId', required: false, type: String, description: 'ID nhóm dịch vụ' })
    @ApiQuery({ name: 'parentServiceId', required: false, type: String, description: 'ID dịch vụ cha' })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Trạng thái hoạt động' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Tìm kiếm' })
    @ApiQuery({ name: 'minPrice', required: false, type: String, description: 'Giá tối thiểu' })
    @ApiQuery({ name: 'maxPrice', required: false, type: String, description: 'Giá tối đa' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng mỗi trang' })
    @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Vị trí bắt đầu' })
    async getServices(@Query() query: GetServicesDto) {
        const result = await this.serviceService.getServices(query);
        return ResponseBuilder.successWithPagination(result.services, result.total, result.limit, result.offset);
    }

    @Get('search')
    @ApiOperation({
        summary: 'Tìm kiếm dịch vụ',
        description: 'Tìm kiếm dịch vụ theo từ khóa'
    })
    @ApiResponse({ status: 200, description: 'Kết quả tìm kiếm dịch vụ' })
    @ApiQuery({ name: 'search', required: true, type: String, description: 'Từ khóa tìm kiếm' })
    @ApiQuery({ name: 'serviceGroupId', required: false, type: String, description: 'ID nhóm dịch vụ' })
    @ApiQuery({ name: 'rootOnly', required: false, type: Boolean, description: 'Chỉ tìm dịch vụ gốc' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng mỗi trang' })
    @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Vị trí bắt đầu' })
    async searchServices(@Query() query: SearchServicesDto) {
        const result = await this.serviceService.searchServices(query);
        return ResponseBuilder.successWithPagination(result.services, result.total, result.limit, result.offset);
    }

    @Get('root')
    @ApiOperation({
        summary: 'Lấy danh sách dịch vụ gốc',
        description: 'Lấy danh sách các dịch vụ không có cha (dịch vụ gốc)'
    })
    @ApiResponse({ status: 200, description: 'Danh sách dịch vụ gốc', type: [ServiceResponseDto] })
    async getRootServices() {
        const services = await this.serviceService.getRootServices();
        return ResponseBuilder.success(services);
    }

    @Get('group/:groupId')
    @ApiOperation({
        summary: 'Lấy dịch vụ theo nhóm',
        description: 'Lấy danh sách dịch vụ thuộc một nhóm cụ thể'
    })
    @ApiResponse({ status: 200, description: 'Danh sách dịch vụ theo nhóm' })
    @ApiParam({ name: 'groupId', description: 'ID nhóm dịch vụ' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng mỗi trang' })
    @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Vị trí bắt đầu' })
    async getServicesByGroup(
        @Param('groupId') groupId: string,
        @Query('limit') limit?: number,
        @Query('offset') offset?: number,
    ) {
        const result = await this.serviceService.getServicesByGroup(groupId, limit, offset);
        return ResponseBuilder.successWithPagination(result.services, result.total, result.limit, result.offset);
    }

    @Get('parent/:parentId')
    @ApiOperation({
        summary: 'Lấy dịch vụ con',
        description: 'Lấy danh sách dịch vụ con của một dịch vụ cha'
    })
    @ApiResponse({ status: 200, description: 'Danh sách dịch vụ con', type: [ServiceResponseDto] })
    @ApiParam({ name: 'parentId', description: 'ID dịch vụ cha' })
    async getSubServices(@Param('parentId') parentId: string) {
        const services = await this.serviceService.getSubServices(parentId);
        return ResponseBuilder.success(services);
    }

    @Get('price-range')
    @ApiOperation({
        summary: 'Lấy dịch vụ theo khoảng giá',
        description: 'Lấy danh sách dịch vụ trong một khoảng giá cụ thể'
    })
    @ApiResponse({ status: 200, description: 'Danh sách dịch vụ theo khoảng giá', type: [ServiceResponseDto] })
    @ApiQuery({ name: 'minPrice', required: true, type: Number, description: 'Giá tối thiểu' })
    @ApiQuery({ name: 'maxPrice', required: true, type: Number, description: 'Giá tối đa' })
    async getServicesByPriceRange(
        @Query('minPrice') minPrice: number,
        @Query('maxPrice') maxPrice: number,
    ) {
        const services = await this.serviceService.getServicesByPriceRange(minPrice, maxPrice);
        return ResponseBuilder.success(services);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Lấy thông tin dịch vụ',
        description: 'Lấy thông tin chi tiết của một dịch vụ'
    })
    @ApiResponse({ status: 200, description: 'Thông tin dịch vụ', type: ServiceResponseDto })
    @ApiParam({ name: 'id', description: 'ID của dịch vụ' })
    async getServiceById(@Param('id') id: string) {
        const service = await this.serviceService.getServiceById(id);
        return ResponseBuilder.success(service);
    }

    @Get(':id/with-children')
    @ApiOperation({
        summary: 'Lấy dịch vụ kèm dịch vụ con',
        description: 'Lấy thông tin dịch vụ kèm danh sách dịch vụ con'
    })
    @ApiResponse({ status: 200, description: 'Dịch vụ kèm dịch vụ con', type: ServiceWithChildrenResponseDto })
    @ApiParam({ name: 'id', description: 'ID của dịch vụ' })
    async getServiceWithChildren(@Param('id') id: string) {
        const service = await this.serviceService.getServiceWithChildren(id);
        return ResponseBuilder.success(service);
    }

    @Get(':id/hierarchy')
    @ApiOperation({
        summary: 'Lấy cây phân cấp dịch vụ',
        description: 'Lấy cây phân cấp đầy đủ của dịch vụ và các dịch vụ con'
    })
    @ApiResponse({ status: 200, description: 'Cây phân cấp dịch vụ', type: ServiceHierarchyResponseDto })
    @ApiParam({ name: 'id', description: 'ID của dịch vụ' })
    async getServiceHierarchy(@Param('id') id: string) {
        const hierarchy = await this.serviceService.getServiceHierarchy(id);
        return ResponseBuilder.success(hierarchy);
    }
}
