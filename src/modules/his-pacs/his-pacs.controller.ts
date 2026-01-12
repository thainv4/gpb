import { Controller, Post, Body, Query, BadRequestException, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBody, ApiQuery } from '@nestjs/swagger';
import { HisPacsService } from './his-pacs.service';
import { UpdateResultDto } from './dto/update-result.dto';
import { UpdateResultResponseDto } from './dto/update-result-response.dto';
import { StartResponseArrayDto } from './dto/start-response.dto';

@ApiTags('his-pacs')
@Controller('his-pacs')
export class HisPacsController {
    constructor(
        private readonly hisPacsService: HisPacsService,
    ) { }

    @Post('update-result')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Cập nhật kết quả HIS PACS',
        description: 'API proxy để gọi HIS PACS UpdateResult API. Luôn query HIS_SERE_SERV trước để lấy AccessionNumber từ id. Yêu cầu query params tdlServiceReqCode và tdlServiceCode. Chỉ cần header TokenCode (hisTokenCode từ login response).',
    })
    @ApiHeader({
        name: 'TokenCode',
        description: 'HIS token code (required - lấy từ login response hisTokenCode)',
        required: true,
    })
    @ApiQuery({ name: 'tdlServiceReqCode', description: 'Mã yêu cầu dịch vụ (required - để query HIS_SERE_SERV và lấy AccessionNumber)', example: '000063851158', required: true })
    @ApiQuery({ name: 'tdlServiceCode', description: 'Mã dịch vụ (required - để query HIS_SERE_SERV và lấy AccessionNumber)', example: 'BM00233', required: true })
    @ApiBody({ type: UpdateResultDto })
    @ApiResponse({
        status: 200,
        description: 'Cập nhật kết quả thành công',
        type: UpdateResultResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - Dữ liệu đầu vào không hợp lệ, thiếu TokenCode header hoặc query params, hoặc HIS PACS API trả về lỗi',
    })
    @ApiResponse({
        status: 404,
        description: 'Not found - Không tìm thấy HIS_SERE_SERV với query params đã cho',
    })
    async updateResult(
        @Body() updateResultDto: UpdateResultDto,
        @Query('tdlServiceReqCode') tdlServiceReqCode: string,
        @Query('tdlServiceCode') tdlServiceCode: string,
        @Request() req: any,
    ): Promise<UpdateResultResponseDto> {
        // Lấy TokenCode từ header (là hisTokenCode từ login response)
        const tokenCode = req.headers['tokencode'] || req.headers['TokenCode'];

        if (!tokenCode) {
            throw new BadRequestException(
                'TokenCode header is required. Please provide hisTokenCode from login response.'
            );
        }

        // Validate query params
        if (!tdlServiceReqCode || !tdlServiceCode) {
            throw new BadRequestException(
                'Query params tdlServiceReqCode and tdlServiceCode are required to query HIS_SERE_SERV and get AccessionNumber.'
            );
        }

        // Luôn query HIS_SERE_SERV trước để lấy AccessionNumber
        const hisSereServResult = await this.hisPacsService.getHisSereServId(tdlServiceReqCode, tdlServiceCode);
        
        // Tự động set AccessionNumber từ response HIS_SERE_SERV vào request body (override nếu có trong body)
        updateResultDto.ApiData.AccessionNumber = hisSereServResult.accessionNumber;

        // Gọi HIS PACS API
        const result = await this.hisPacsService.updateResult(
            updateResultDto,
            tokenCode,
        );

        // Thêm hisSereServId vào response
        result.hisSereServId = hisSereServResult.id;

        return result;
    }

    @Post('start')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Bắt đầu HIS PACS',
        description: 'API proxy để gọi HIS PACS Start API. Query HIS_SERE_SERV trước để lấy danh sách AccessionNumber từ tdlServiceReqCode (không có tdlServiceCode). Gọi API Start cho mỗi AccessionNumber. Yêu cầu query param tdlServiceReqCode. Chỉ cần header TokenCode (hisTokenCode từ login response).',
    })
    @ApiHeader({
        name: 'TokenCode',
        description: 'HIS token code (required - lấy từ login response hisTokenCode)',
        required: true,
    })
    @ApiQuery({ name: 'tdlServiceReqCode', description: 'Mã yêu cầu dịch vụ (required - để query HIS_SERE_SERV và lấy AccessionNumber)', example: '000063851158', required: true })
    @ApiResponse({
        status: 200,
        description: 'Kết quả các lần gọi API Start',
        type: StartResponseArrayDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - Dữ liệu đầu vào không hợp lệ, thiếu TokenCode header hoặc query params',
    })
    @ApiResponse({
        status: 404,
        description: 'Not found - Không tìm thấy HIS_SERE_SERV với query param đã cho',
    })
    async start(
        @Query('tdlServiceReqCode') tdlServiceReqCode: string,
        @Request() req: any,
    ): Promise<StartResponseArrayDto> {
        // Lấy TokenCode từ header (là hisTokenCode từ login response)
        const tokenCode = req.headers['tokencode'] || req.headers['TokenCode'];

        if (!tokenCode) {
            throw new BadRequestException(
                'TokenCode header is required. Please provide hisTokenCode from login response.'
            );
        }

        // Validate query params
        if (!tdlServiceReqCode) {
            throw new BadRequestException(
                'Query param tdlServiceReqCode is required to query HIS_SERE_SERV and get AccessionNumber.'
            );
        }

        // Gọi service
        const result = await this.hisPacsService.start(
            tdlServiceReqCode,
            tokenCode,
        );

        return result;
    }

    @Post('unstart')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Hủy bắt đầu HIS PACS',
        description: 'API proxy để gọi HIS PACS Unstart API. Query HIS_SERE_SERV trước để lấy danh sách AccessionNumber từ tdlServiceReqCode (không có tdlServiceCode). Gọi API Unstart cho mỗi AccessionNumber. Yêu cầu query param tdlServiceReqCode. Chỉ cần header TokenCode (hisTokenCode từ login response).',
    })
    @ApiHeader({
        name: 'TokenCode',
        description: 'HIS token code (required - lấy từ login response hisTokenCode)',
        required: true,
    })
    @ApiQuery({ name: 'tdlServiceReqCode', description: 'Mã yêu cầu dịch vụ (required - để query HIS_SERE_SERV và lấy AccessionNumber)', example: '000063851158', required: true })
    @ApiResponse({
        status: 200,
        description: 'Kết quả các lần gọi API Unstart',
        type: StartResponseArrayDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - Dữ liệu đầu vào không hợp lệ, thiếu TokenCode header hoặc query params',
    })
    @ApiResponse({
        status: 404,
        description: 'Not found - Không tìm thấy HIS_SERE_SERV với query param đã cho',
    })
    async unstart(
        @Query('tdlServiceReqCode') tdlServiceReqCode: string,
        @Request() req: any,
    ): Promise<StartResponseArrayDto> {
        // Lấy TokenCode từ header (là hisTokenCode từ login response)
        const tokenCode = req.headers['tokencode'] || req.headers['TokenCode'];

        if (!tokenCode) {
            throw new BadRequestException(
                'TokenCode header is required. Please provide hisTokenCode from login response.'
            );
        }

        // Validate query params
        if (!tdlServiceReqCode) {
            throw new BadRequestException(
                'Query param tdlServiceReqCode is required to query HIS_SERE_SERV and get AccessionNumber.'
            );
        }

        // Gọi service
        const result = await this.hisPacsService.unstart(
            tdlServiceReqCode,
            tokenCode,
        );

        return result;
    }
}
