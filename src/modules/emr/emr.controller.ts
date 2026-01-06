import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus, BadRequestException, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmrService } from './emr.service';
import { CreateAndSignHsmDto } from './dto/commands/create-and-sign-hsm.dto';
import { EmrApiResponseDto } from './dto/responses/create-and-sign-hsm-response.dto';
import { GetEmrSignerDto } from './dto/queries/get-emr-signer.dto';
import { GetEmrSignerResponseDto } from './dto/responses/get-emr-signer-response.dto';
import { DeleteEmrDocumentDto } from './dto/commands/delete-emr-document.dto';
import { DeleteEmrDocumentResponseDto } from './dto/responses/delete-emr-document-response.dto';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseBuilder } from '../../common/builders/response.builder';

@ApiTags('EMR - Electronic Medical Record')
@Controller('emr')
@UseGuards(DualAuthGuard)
@ApiBearerAuth('JWT-auth')
export class EmrController {
    constructor(private readonly emrService: EmrService) {}

    @Post('create-and-sign-hsm')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Tạo và ký văn bản bằng HSM',
        description: 'API proxy để gọi EMR CreateAndSignHsm. Tạo văn bản mới và ký ngay bằng HSM trong một lần gọi. ' +
            'Hỗ trợ 2 cách authentication: (1) JWT Bearer token + TokenCode/ApplicationCode headers, ' +
            'hoặc (2) Chỉ TokenCode/ApplicationCode headers (HIS token trực tiếp).',
    })
    @ApiHeader({
        name: 'Authorization',
        description: 'JWT Bearer token (optional - nếu không có sẽ dùng HIS TokenCode)',
        required: false,
    })
    @ApiHeader({
        name: 'TokenCode',
        description: 'HIS token code (required nếu không có JWT token)',
        required: false,
    })
    @ApiHeader({
        name: 'ApplicationCode',
        description: 'Mã ứng dụng được quy định cho phần mềm HIS (required nếu dùng HIS token)',
        required: false,
    })
    @ApiBody({ type: CreateAndSignHsmDto })
    @ApiResponse({
        status: 200,
        description: 'Tạo và ký văn bản thành công',
        type: EmrApiResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - Dữ liệu đầu vào không hợp lệ hoặc EMR API trả về lỗi',
    })
    async createAndSignHsm(
        @Body() createAndSignHsmDto: CreateAndSignHsmDto,
        @Request() req: any,
    ): Promise<EmrApiResponseDto> {
        // Lấy token từ request (đã được guard xử lý)
        // Nếu là JWT auth, cần lấy HIS token từ user profile hoặc yêu cầu header
        // Nếu là HIS auth, lấy từ header
        let tokenCode: string;
        let applicationCode: string;

        if (req.authType === 'HIS') {
            // Đã được DualAuthGuard set vào request
            tokenCode = req.hisTokenCode;
            applicationCode = req.applicationCode;
        } else {
            // JWT auth - cần lấy từ header hoặc từ user profile
            tokenCode = req.headers['tokencode'] || req.headers['TokenCode'];
            applicationCode = req.headers['applicationcode'] || req.headers['ApplicationCode'];

            if (!tokenCode || !applicationCode) {
                throw new BadRequestException(
                    'TokenCode and ApplicationCode headers are required when using JWT authentication. ' +
                    'Alternatively, you can use HIS TokenCode header for direct HIS authentication.'
                );
            }
        }

        return this.emrService.createAndSignHsm(
            createAndSignHsmDto,
            tokenCode,
            applicationCode,
        );
    }

    @Get('signer')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Lấy thông tin EMR Signer',
        description: 'API proxy để gọi EMR EmrSigner/Get. Lấy thông tin người ký từ EMR system dựa trên mappedUsername của user hiện tại. ' +
            'Hỗ trợ 2 cách authentication: (1) JWT Bearer token + TokenCode/ApplicationCode headers, ' +
            'hoặc (2) Chỉ TokenCode/ApplicationCode headers (HIS token trực tiếp).',
    })
    @ApiHeader({
        name: 'Authorization',
        description: 'JWT Bearer token (optional - nếu không có sẽ dùng HIS TokenCode)',
        required: false,
    })
    @ApiHeader({
        name: 'TokenCode',
        description: 'HIS token code (required)',
        required: false,
    })
    @ApiHeader({
        name: 'ApplicationCode',
        description: 'Mã ứng dụng được quy định cho phần mềm HIS (required)',
        required: false,
    })
    @ApiQuery({ name: 'Start', required: false, type: Number, description: 'Số bản ghi bắt đầu (pagination offset)', example: 0 })
    @ApiQuery({ name: 'Limit', required: false, type: Number, description: 'Số lượng bản ghi tối đa (pagination limit)', example: 10 })
    @ApiQuery({ name: 'loginname', required: false, type: String, description: 'Login name để tìm kiếm (bắt buộc nếu không dùng JWT)', example: 'vht2' })
    @ApiResponse({
        status: 200,
        description: 'Lấy thông tin EMR Signer thành công',
        type: GetEmrSignerResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - Thiếu loginname hoặc user không có mappedUsername hoặc EMR API trả về lỗi',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Thiếu TokenCode/ApplicationCode',
    })
    async getEmrSigner(
        @Query() query: GetEmrSignerDto,
        @CurrentUser() currentUser: { id: string; username: string; email: string } | null,
        @Request() req: any,
    ): Promise<any> {
        // Lấy TokenCode và ApplicationCode từ request
        let tokenCode: string;
        let applicationCode: string;

        if (req.authType === 'HIS') {
            // Đã được DualAuthGuard set vào request
            tokenCode = req.hisTokenCode;
            applicationCode = req.applicationCode;
        } else {
            // JWT auth hoặc no auth - cần lấy từ header
            tokenCode = req.headers['tokencode'] || req.headers['TokenCode'];
            applicationCode = req.headers['applicationcode'] || req.headers['ApplicationCode'];

            if (!tokenCode || !applicationCode) {
                throw new BadRequestException(
                    'TokenCode and ApplicationCode headers are required for EMR API calls.'
                );
            }
        }

        // Nếu có JWT token, lấy từ profile. Nếu không, phải có loginname trong query
        let userId: string | undefined;
        if (currentUser) {
            userId = currentUser.id;
        } else if (!query.loginname) {
            throw new BadRequestException(
                'Either JWT authentication or loginname query parameter is required.'
            );
        }

        const result = await this.emrService.getEmrSigner(userId, query, tokenCode, applicationCode);
        return ResponseBuilder.success(result);
    }

    @Post('delete-document')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Xóa văn bản EMR',
        description: 'API proxy để gọi EMR EmrDocument/Delete. Xóa văn bản EMR bằng documentId. ' +
            'Hỗ trợ 2 cách authentication: (1) JWT Bearer token + TokenCode/ApplicationCode headers, ' +
            'hoặc (2) Chỉ TokenCode/ApplicationCode headers (HIS token trực tiếp).',
    })
    @ApiHeader({
        name: 'Authorization',
        description: 'JWT Bearer token (optional - nếu không có sẽ dùng HIS TokenCode)',
        required: false,
    })
    @ApiHeader({
        name: 'TokenCode',
        description: 'HIS token code (required nếu không có JWT token)',
        required: false,
    })
    @ApiHeader({
        name: 'ApplicationCode',
        description: 'Mã ứng dụng được quy định cho phần mềm HIS (required nếu dùng HIS token)',
        required: false,
    })
    @ApiBody({ type: DeleteEmrDocumentDto })
    @ApiResponse({
        status: 200,
        description: 'Xóa văn bản EMR thành công',
        type: DeleteEmrDocumentResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - Dữ liệu đầu vào không hợp lệ hoặc EMR API trả về lỗi',
    })
    async deleteEmrDocument(
        @Body() deleteEmrDocumentDto: DeleteEmrDocumentDto,
        @Request() req: any,
    ): Promise<DeleteEmrDocumentResponseDto> {
        let tokenCode: string;
        let applicationCode: string;

        if (req.authType === 'HIS') {
            tokenCode = req.hisTokenCode;
            applicationCode = req.applicationCode;
        } else {
            tokenCode = req.headers['tokencode'] || req.headers['TokenCode'];
            applicationCode = req.headers['applicationcode'] || req.headers['ApplicationCode'];

            if (!tokenCode || !applicationCode) {
                throw new BadRequestException(
                    'TokenCode and ApplicationCode headers are required when using JWT authentication. ' +
                    'Alternatively, you can use HIS TokenCode header for direct HIS authentication.'
                );
            }
        }

        return this.emrService.deleteEmrDocument(
            deleteEmrDocumentDto.documentId,
            tokenCode,
            applicationCode,
        );
    }
}

