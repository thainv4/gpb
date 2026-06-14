import { ApiProperty } from '@nestjs/swagger';

export class HisBranchResponseDto {
    @ApiProperty({ description: 'HIS_BRANCH.ID', example: 1 })
    id: number;

    @ApiProperty({ description: 'Mã cơ sở (HIS_BRANCH.BRANCH_CODE)', example: 'BM1' })
    branchCode: string;

    @ApiProperty({ description: 'Tên cơ sở (HIS_BRANCH.BRANCH_NAME)', example: 'Bệnh viện Bạch Mai' })
    branchName: string;
}
