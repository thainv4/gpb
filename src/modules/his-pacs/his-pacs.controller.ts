import { Controller, Post, Body, Get, Query, BadRequestException, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBody, ApiQuery } from '@nestjs/swagger';
import { HisPacsService } from './his-pacs.service';
import { UpdateResultDto } from './dto/update-result.dto';
import { UpdateResultResponseDto } from './dto/update-result-response.dto';
import { GetHisSereServDto } from '../his-sere-serv/dto/get-his-sere-serv.dto';
import { HisSereServResponseDto } from '../his-sere-serv/dto/his-sere-serv-response.dto';
import { ResponseBuilder } from '../../common/builders/response.builder';

@ApiTags('his-pacs')
@Controller('his-pacs')
export class HisPacsController {
    constructor(
        private readonly hisPacsService: HisPacsService,
    ) { }

    @Get('his-sere-serv')
    @ApiOperation({ summary: 'Lấy ID và AccessionNumber từ HIS_SERE_SERV theo mã yêu cầu dịch vụ và mã dịch vụ' })
    @ApiQuery({ name: 'tdlServiceReqCode', description: 'Mã yêu cầu dịch vụ', example: '000063851158', required: true })
    @ApiQuery({ name: 'tdlServiceCode', description: 'Mã dịch vụ', example: 'BM00233', required: true })
    @ApiResponse({ status: 200, type: HisSereServResponseDto, description: 'Trả về ID và AccessionNumber' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy record' })
    async getHisSereServId(@Query() query: GetHisSereServDto) {
        const result = await this.hisPacsService.getHisSereServId(query.tdlServiceReqCode, query.tdlServiceCode);
        return ResponseBuilder.success(result);
    }

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
}
