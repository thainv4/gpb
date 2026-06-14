import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Backfill HIS_BRANCH_ID cho y lệnh đã lưu trước khi có multi-branch.
 * Toàn bộ dữ liệu cũ thuộc cơ sở 1 (Hà Nội) → gán PRIMARY_HIS_BRANCH_ID.
 *
 * Yêu cầu: PRIMARY_HIS_BRANCH_ID trong .env (vd 1).
 * Idempotent: chỉ cập nhật các dòng HIS_BRANCH_ID IS NULL.
 */
export class BackfillHisBranchIdOnStoredServiceRequests1740000001700
    implements MigrationInterface
{
    name = 'BackfillHisBranchIdOnStoredServiceRequests1740000001700';

    private parseBranchId(value: string | undefined): number | undefined {
        if (value === undefined || value.trim() === '') return undefined;
        const n = Number(value);
        return Number.isFinite(n) ? n : undefined;
    }

    private async columnExists(
        queryRunner: QueryRunner,
        tableName: string,
        columnName: string,
    ): Promise<boolean> {
        const rows = await queryRunner.query(`
            SELECT COUNT(1) AS "cnt"
            FROM user_tab_columns
            WHERE table_name = '${tableName}'
              AND column_name = '${columnName}'
        `);
        return Number(rows[0]?.cnt ?? rows[0]?.CNT ?? 0) > 0;
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await this.columnExists(queryRunner, 'BML_STORED_SERVICE_REQUESTS', 'HIS_BRANCH_ID'))) {
            return;
        }

        const primaryBranchId = this.parseBranchId(process.env.PRIMARY_HIS_BRANCH_ID);
        if (primaryBranchId === undefined) {
            throw new Error(
                'BackfillHisBranchIdOnStoredServiceRequests: cần đặt PRIMARY_HIS_BRANCH_ID trong .env trước khi chạy migration này.',
            );
        }

        await queryRunner.query(
            `UPDATE BML_STORED_SERVICE_REQUESTS
             SET HIS_BRANCH_ID = :1
             WHERE HIS_BRANCH_ID IS NULL
               AND DELETED_AT IS NULL`,
            [primaryBranchId],
        );
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        // Không revert: không phân biệt được bản ghi backfill vs bản ghi lưu mới với cùng HIS_BRANCH_ID.
    }
}
