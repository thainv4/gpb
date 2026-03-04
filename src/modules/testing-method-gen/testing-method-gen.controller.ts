import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TestingMethodGenService } from './testing-method-gen.service';
import { CreateTestingMethodGenDto } from './dto/commands/create-testing-method-gen.dto';
import { UpdateTestingMethodGenDto } from './dto/commands/update-testing-method-gen.dto';
import { GetTestingMethodsGenDto } from './dto/queries/get-testing-methods-gen.dto';
import { TestingMethodGenResponseDto } from './dto/responses/testing-method-gen-response.dto';
import { TestingMethodsGenListResponseDto } from './dto/responses/testing-methods-gen-list-response.dto';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser as ICurrentUser } from '../../common/interfaces/current-user.interface';

@ApiTags('Testing Methods Gen')
@Controller('testing-methods-gen')
@UseGuards(DualAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TestingMethodGenController {
    constructor(private readonly testingMethodGenService: TestingMethodGenService) {}

    @Post()
    @ApiOperation({ summary: 'Tạo phương pháp xét nghiệm', description: 'Tạo mới (BML_TESTING_METHOD_GEN)' })
    @ApiBody({ type: CreateTestingMethodGenDto })
    @ApiResponse({ status: 201, description: 'Tạo thành công', type: TestingMethodGenResponseDto })
    @ApiResponse({ status: 409, description: 'Phương pháp xét nghiệm đã tồn tại' })
    async create(
        @Body() createDto: CreateTestingMethodGenDto,
        @CurrentUser() currentUser: ICurrentUser,
    ) {
        const id = await this.testingMethodGenService.create(createDto, currentUser);
        return ResponseBuilder.success({ id }, HttpStatus.CREATED);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật phương pháp xét nghiệm' })
    @ApiParam({ name: 'id', description: 'ID phương pháp xét nghiệm' })
    @ApiBody({ type: UpdateTestingMethodGenDto })
    @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy' })
    @ApiResponse({ status: 409, description: 'Tên đã tồn tại' })
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateTestingMethodGenDto,
        @CurrentUser() currentUser: ICurrentUser,
    ) {
        await this.testingMethodGenService.update(id, updateDto, currentUser);
        return ResponseBuilder.success({ message: 'Testing method gen updated successfully' });
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa phương pháp xét nghiệm (soft delete)' })
    @ApiParam({ name: 'id', description: 'ID phương pháp xét nghiệm' })
    @ApiResponse({ status: 200, description: 'Xóa thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy' })
    async delete(@Param('id') id: string) {
        await this.testingMethodGenService.delete(id);
        return ResponseBuilder.success({ message: 'Testing method gen deleted successfully' });
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách phương pháp xét nghiệm', description: 'Phân trang và tìm kiếm theo tên' })
    @ApiQuery({ name: 'limit', required: false, description: 'Số lượng bản ghi' })
    @ApiQuery({ name: 'offset', required: false, description: 'Vị trí bắt đầu' })
    @ApiQuery({ name: 'search', required: false, description: 'Từ khóa tìm kiếm' })
    @ApiResponse({ status: 200, description: 'Danh sách', type: TestingMethodsGenListResponseDto })
    async getList(@Query() query: GetTestingMethodsGenDto) {
        const result = await this.testingMethodGenService.getList(query);
        return ResponseBuilder.success(result);
    }

    @Get('search/method-name')
    @ApiOperation({ summary: 'Tìm theo tên phương pháp (chính xác)' })
    @ApiQuery({ name: 'methodName', required: true, description: 'Tên phương pháp', example: 'Venipuncture' })
    @ApiResponse({ status: 200, type: TestingMethodGenResponseDto })
    @ApiResponse({ status: 404, description: 'Không tìm thấy' })
    async getByMethodName(@Query('methodName') methodName: string) {
        const item = await this.testingMethodGenService.getByMethodName(methodName);
        return ResponseBuilder.success(item);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết phương pháp xét nghiệm theo ID' })
    @ApiParam({ name: 'id', description: 'ID phương pháp xét nghiệm' })
    @ApiResponse({ status: 200, type: TestingMethodGenResponseDto })
    @ApiResponse({ status: 404, description: 'Không tìm thấy' })
    async getById(@Param('id') id: string) {
        const item = await this.testingMethodGenService.getById(id);
        return ResponseBuilder.success(item);
    }
}
