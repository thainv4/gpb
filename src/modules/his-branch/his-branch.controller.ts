import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HisBranchService } from './his-branch.service';
import { HisBranchResponseDto } from './dto/responses/his-branch-response.dto';
import { ResponseBuilder } from '../../common/builders/response.builder';

// Endpoint công khai (không guard): danh sách cơ sở cần hiển thị ở màn login trước khi đăng nhập.
@ApiTags('HIS Branches')
@Controller('his-branches')
export class HisBranchController {
    constructor(private readonly hisBranchService: HisBranchService) { }

    @Get()
    @ApiOperation({
        summary: 'Danh sách cơ sở từ HIS',
        description: 'Lấy danh sách cơ sở (HIS_BRANCH) dùng cho dropdown chọn cơ sở khi đăng nhập.',
    })
    @ApiResponse({ status: 200, type: [HisBranchResponseDto] })
    async getBranches() {
        const branches = await this.hisBranchService.getBranches();
        return ResponseBuilder.success(branches);
    }
}
