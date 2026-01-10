import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HisSereServService } from './his-sere-serv.service';
import { GetHisSereServDto } from './dto/get-his-sere-serv.dto';
import { HisSereServResponseDto } from './dto/his-sere-serv-response.dto';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';

@ApiTags('his-sere-serv')
@ApiBearerAuth('JWT-auth')
@UseGuards(DualAuthGuard)
@Controller('his-sere-serv')
export class HisSereServController {
    constructor(
        private readonly hisSereServService: HisSereServService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Lấy ID từ HIS_SERE_SERV theo mã yêu cầu dịch vụ và mã dịch vụ' })
    @ApiQuery({ name: 'tdlServiceReqCode', description: 'Mã yêu cầu dịch vụ', example: '000063851158', required: true })
    @ApiQuery({ name: 'tdlServiceCode', description: 'Mã dịch vụ', example: 'BM00233', required: true })
    @ApiResponse({ status: 200, type: HisSereServResponseDto, description: 'Trả về ID' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy record' })
    async getHisSereServId(@Query() query: GetHisSereServDto) {
        const result = await this.hisSereServService.getHisSereServId(query);
        return ResponseBuilder.success(result);
    }
}
