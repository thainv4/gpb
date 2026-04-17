import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HisEkipService } from './his-ekip.service';
import { GetHisEkipUsersQueryDto } from './dto/queries/get-his-ekip-users-query.dto';
import { HisExecuteRoleResponseDto } from './dto/responses/his-execute-role-response.dto';
import { HisEkipUserResponseDto } from './dto/responses/his-ekip-user-response.dto';
import { ResponseBuilder } from '../../common/builders/response.builder';
import { DualAuthGuard } from '../auth/guards/dual-auth.guard';

@ApiTags('his-ekip')
@ApiBearerAuth('JWT-auth')
@UseGuards(DualAuthGuard)
@Controller('his-ekip')
export class HisEkipController {
    constructor(private readonly hisEkipService: HisEkipService) {}

    @Get('execute-roles')
    @ApiOperation({ summary: 'Danh sách vai trò thực hiện (kíp xét nghiệm) đang active' })
    @ApiResponse({ status: 200, type: [HisExecuteRoleResponseDto] })
    async listExecuteRoles() {
        const data = await this.hisEkipService.listActiveExecuteRoles();
        return ResponseBuilder.success(data);
    }

    @Get('users')
    @ApiOperation({
        summary: 'Danh sách user kíp theo khoa và vai trò thực hiện',
        description:
            'Tương đương: SELECT id, username, loginname FROM HIS_EKIP_USER WHERE department_id = ? AND execute_role_id = ?',
    })
    @ApiResponse({ status: 200, type: [HisEkipUserResponseDto] })
    async listEkipUsers(@Query() query: GetHisEkipUsersQueryDto) {
        const data = await this.hisEkipService.listEkipUsersByDepartment(query);
        return ResponseBuilder.success(data);
    }
}
