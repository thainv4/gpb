import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HisBranchResponseDto } from './dto/responses/his-branch-response.dto';
import { getAllowedHisBranchIds } from '../../common/constants/branch.constants';

@Injectable()
export class HisBranchService {
    constructor(
        @InjectDataSource('hisConnection')
        private readonly dataSource: DataSource,
    ) { }

    /**
     * Danh sách cơ sở từ HIS_BRANCH (cho dropdown chọn cơ sở khi login).
     * Nếu đã cấu hình PRIMARY_HIS_BRANCH_ID + NINH_BINH_HIS_BRANCH_ID thì chỉ trả 2 cơ sở đó.
     */
    async getBranches(): Promise<HisBranchResponseDto[]> {
        const sql = `
            SELECT ID, BRANCH_CODE, BRANCH_NAME
            FROM HIS_BRANCH
            WHERE (IS_DELETE IS NULL OR IS_DELETE = 0)
              AND (IS_ACTIVE IS NULL OR IS_ACTIVE = 1)
            ORDER BY ID`;

        const rows: any[] = await this.dataSource.query(sql);

        const branches = rows.map((r) => ({
            id: Number(r.ID),
            branchCode: r.BRANCH_CODE,
            branchName: r.BRANCH_NAME,
        }));

        const allowedIds = getAllowedHisBranchIds();
        if (allowedIds.length === 2) {
            return branches.filter((b) => allowedIds.includes(b.id));
        }
        return branches;
    }
}
