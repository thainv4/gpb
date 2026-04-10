import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser as ICurrentUser } from '../../common/interfaces/current-user.interface';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';
import { CreateFrontendApiLogDto } from './dto/commands/create-frontend-api-log.dto';
import { FrontendApiLogService } from './frontend-api-log.service';

@ApiTags('Frontend API Logs')
@Controller('frontend-api-logs')
@UseGuards(DualAuthGuard)
@ApiBearerAuth('JWT-auth')
export class FrontendApiLogController {
    constructor(private readonly frontendApiLogService: FrontendApiLogService) { }

    @Post()
    @ApiOperation({
        summary: 'Ghi log trạng thái API từ frontend',
        description: 'Nhận log trạng thái API (đặc biệt cho nút Lưu test-indications) và ghi bằng Winston.',
    })
    @ApiBody({ type: CreateFrontendApiLogDto })
    @ApiResponse({ status: 201, description: 'Log được ghi thành công' })
    async createLog(
        @Body() dto: CreateFrontendApiLogDto,
        @CurrentUser() currentUser: ICurrentUser | null,
    ) {
        this.frontendApiLogService.logFrontendApiStatus(dto, currentUser);
        return ResponseBuilder.success({ accepted: true }, HttpStatus.CREATED);
    }
}
