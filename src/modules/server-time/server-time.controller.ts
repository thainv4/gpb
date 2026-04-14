import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { ServerTimeService } from './server-time.service';

@ApiTags('System')
@Controller('server-time')
@UseGuards(DualAuthGuard)
@ApiBearerAuth()
export class ServerTimeController {
    constructor(private readonly serverTimeService: ServerTimeService) {}

    @Get()
    @ApiOperation({
        summary: 'LIS server time from Oracle (SYSTIMESTAMP)',
        description: 'Returns database clock as ISO 8601 UTC. Used by forms instead of client clock.',
    })
    @ApiResponse({
        status: 200,
        description: 'OK',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 200 },
                data: {
                    type: 'object',
                    properties: {
                        serverTime: { type: 'string', example: '2026-04-14T04:30:00.000Z' },
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 503, description: 'Database unavailable' })
    async getServerTime() {
        const serverTime = await this.serverTimeService.getDatabaseServerTimeIso();
        return ResponseBuilder.success({ serverTime });
    }
}
