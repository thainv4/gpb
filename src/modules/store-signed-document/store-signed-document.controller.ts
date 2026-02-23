import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpStatus,
    Header,
    StreamableFile,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { StoredSignedDocumentService } from './store-signed-document.service';
import { CreateStoredSignedDocumentDto } from './dto/commands/create-stored-signed-document.dto';
import { UpdateStoredSignedDocumentDto } from './dto/commands/update-stored-signed-document.dto';
import { GetStoredSignedDocumentsDto } from './dto/queries/get-stored-signed-documents.dto';
import { StoredSignedDocumentResponseDto } from './dto/responses/stored-signed-document-response.dto';
import { StoredSignedDocumentsListResponseDto } from './dto/responses/stored-signed-documents-list-response.dto';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser as ICurrentUser } from '../../common/interfaces/current-user.interface';

@ApiTags('Stored Signed Documents')
@Controller('store-signed-documents')
@UseGuards(DualAuthGuard)
@ApiBearerAuth('JWT-auth')
export class StoredSignedDocumentController {
    constructor(
        private readonly storedSignedDocumentService: StoredSignedDocumentService,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Tạo stored signed document' })
    @ApiBody({ type: CreateStoredSignedDocumentDto })
    @ApiResponse({ status: 201, description: 'Tạo thành công' })
    @ApiResponse({ status: 409, description: 'Đã tồn tại cho stored service request' })
    async create(
        @Body() createDto: CreateStoredSignedDocumentDto,
        @CurrentUser() currentUser: ICurrentUser,
    ) {
        const id = await this.storedSignedDocumentService.create(createDto, currentUser);
        return ResponseBuilder.success({ id }, HttpStatus.CREATED);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật stored signed document' })
    @ApiParam({ name: 'id', description: 'ID' })
    @ApiBody({ type: UpdateStoredSignedDocumentDto })
    @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy' })
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateStoredSignedDocumentDto,
        @CurrentUser() currentUser: ICurrentUser,
    ) {
        await this.storedSignedDocumentService.update(id, updateDto, currentUser);
        return ResponseBuilder.success({ message: 'Stored signed document updated successfully' });
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa stored signed document (soft delete)' })
    @ApiParam({ name: 'id', description: 'ID' })
    @ApiResponse({ status: 200, description: 'Xóa thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy' })
    async delete(@Param('id') id: string) {
        await this.storedSignedDocumentService.delete(id);
        return ResponseBuilder.success({ message: 'Stored signed document deleted successfully' });
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách stored signed documents' })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'offset', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'documentId', required: false, description: 'Lọc theo documentId' })
    @ApiQuery({ name: 'includeBase64', required: false, description: 'Bao gồm base64 trong response (mặc định false)' })
    @ApiResponse({ status: 200, type: StoredSignedDocumentsListResponseDto })
    async getList(
        @Query() query: GetStoredSignedDocumentsDto,
        @Query('includeBase64') includeBase64?: string,
    ) {
        const result = await this.storedSignedDocumentService.getList(query, includeBase64 === 'true');
        return ResponseBuilder.successWithPagination(
            result.items,
            result.total,
            result.limit,
            result.offset
        );
    }

    @Get('by-stored-service-req/:storedServiceReqId/document')
    @Header('Content-Disposition', 'inline; filename="signed-document.pdf"')
    @ApiOperation({ summary: 'Stream PDF văn bản đã ký theo storedServiceReqId' })
    @ApiParam({ name: 'storedServiceReqId', description: 'ID StoredServiceRequest' })
    @ApiResponse({ status: 200, description: 'File PDF', content: { 'application/pdf': {} } })
    @ApiResponse({ status: 404, description: 'Không tìm thấy hoặc không có nội dung' })
    async getDocumentStreamByStoredServiceReqId(@Param('storedServiceReqId') storedServiceReqId: string) {
        const { buffer, contentType } =
            await this.storedSignedDocumentService.getDocumentBufferByStoredServiceReqId(storedServiceReqId);
        return new StreamableFile(buffer, { type: contentType });
    }

    @Get('by-stored-service-req/:storedServiceReqId')
    @ApiOperation({ summary: 'Lấy theo storedServiceReqId' })
    @ApiParam({ name: 'storedServiceReqId', description: 'ID StoredServiceRequest' })
    @ApiResponse({ status: 200, type: StoredSignedDocumentResponseDto })
    @ApiResponse({ status: 404, description: 'Không tìm thấy' })
    async getByStoredServiceReqId(@Param('storedServiceReqId') storedServiceReqId: string) {
        const doc = await this.storedSignedDocumentService.getByStoredServiceReqId(storedServiceReqId);
        if (!doc) {
            return ResponseBuilder.success(null);
        }
        return ResponseBuilder.success(doc);
    }

    @Get('by-his-code/:hisServiceReqCode/document')
    @Header('Content-Disposition', 'inline; filename="signed-document.pdf"')
    @ApiOperation({ summary: 'Stream PDF văn bản đã ký theo hisServiceReqCode' })
    @ApiParam({ name: 'hisServiceReqCode', description: 'Mã yêu cầu dịch vụ HIS' })
    @ApiResponse({ status: 200, description: 'File PDF', content: { 'application/pdf': {} } })
    @ApiResponse({ status: 404, description: 'Không tìm thấy hoặc không có nội dung' })
    async getDocumentStreamByHisServiceReqCode(@Param('hisServiceReqCode') hisServiceReqCode: string) {
        const { buffer, contentType } =
            await this.storedSignedDocumentService.getDocumentBufferByHisServiceReqCode(hisServiceReqCode);
        return new StreamableFile(buffer, { type: contentType });
    }

    @Get('by-his-code/:hisServiceReqCode')
    @ApiOperation({ summary: 'Lấy theo hisServiceReqCode' })
    @ApiParam({ name: 'hisServiceReqCode', description: 'Mã yêu cầu dịch vụ HIS' })
    @ApiResponse({ status: 200, type: StoredSignedDocumentResponseDto })
    async getByHisServiceReqCode(@Param('hisServiceReqCode') hisServiceReqCode: string) {
        const doc = await this.storedSignedDocumentService.getByHisServiceReqCode(hisServiceReqCode);
        if (!doc) {
            return ResponseBuilder.success(null);
        }
        return ResponseBuilder.success(doc);
    }

    @Get('by-document-id/:documentId/document')
    @Header('Content-Disposition', 'inline; filename="signed-document.pdf"')
    @ApiOperation({ summary: 'Stream PDF văn bản đã ký theo documentId' })
    @ApiParam({ name: 'documentId', description: 'ID văn bản EMR' })
    @ApiResponse({ status: 200, description: 'File PDF', content: { 'application/pdf': {} } })
    @ApiResponse({ status: 404, description: 'Không tìm thấy hoặc không có nội dung' })
    async getDocumentStreamByDocumentId(@Param('documentId') documentId: string) {
        const { buffer, contentType } =
            await this.storedSignedDocumentService.getDocumentBufferByDocumentId(Number(documentId));
        return new StreamableFile(buffer, { type: contentType });
    }

    @Get('by-document-id/:documentId')
    @ApiOperation({ summary: 'Lấy theo documentId' })
    @ApiParam({ name: 'documentId', description: 'ID văn bản EMR' })
    @ApiResponse({ status: 200, type: StoredSignedDocumentResponseDto })
    async getByDocumentId(@Param('documentId') documentId: string) {
        const doc = await this.storedSignedDocumentService.getByDocumentId(Number(documentId));
        if (!doc) {
            return ResponseBuilder.success(null);
        }
        return ResponseBuilder.success(doc);
    }

    @Get('document/:id')
    @Header('Content-Disposition', 'inline; filename="signed-document.pdf"')
    @ApiOperation({ summary: 'Hiển thị văn bản đã ký (decode từ signed_document_base64)' })
    @ApiParam({ name: 'id', description: 'ID stored signed document' })
    @ApiResponse({ status: 200, description: 'File PDF văn bản đã ký', content: { 'application/pdf': {} } })
    @ApiResponse({ status: 404, description: 'Không tìm thấy hoặc không có nội dung' })
    async getDocumentForDisplay(@Param('id') id: string) {
        const { buffer, contentType } = await this.storedSignedDocumentService.getDocumentBufferById(id);
        return new StreamableFile(buffer, { type: contentType });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết theo ID' })
    @ApiParam({ name: 'id', description: 'ID' })
    @ApiQuery({ name: 'includeBase64', required: false, description: 'Bao gồm base64 (mặc định true)' })
    @ApiResponse({ status: 200, type: StoredSignedDocumentResponseDto })
    @ApiResponse({ status: 404, description: 'Không tìm thấy' })
    async getById(
        @Param('id') id: string,
        @Query('includeBase64') includeBase64?: string,
    ) {
        const include = includeBase64 !== 'false';
        const doc = await this.storedSignedDocumentService.getById(id, include);
        return ResponseBuilder.success(doc);
    }
}
