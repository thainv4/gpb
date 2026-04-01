import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Chặn ghi trùng theo nghiệp vụ:
 * - Chỉ xét record "active" (DELETED_AT IS NULL)
 * - Nếu đã có PIVKA/AFP active cho cùng STORED_SR_SERVICES_ID thì không cho insert thêm.
 *
 * Dùng function-based unique index trên Oracle:
 * - Unique index không enforce với NULL (NULLs được phép lặp)
 * - Biểu thức CASE trả về NULL cho record đã soft delete => cho phép lịch sử nhiều lần.
 */
export class AddUniqueIndexActivePivkaResults1740000000700 implements MigrationInterface {
    name = 'AddUniqueIndexActivePivkaResults1740000000700';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Nếu trước đó đã có dữ liệu trùng (DELETED_AT IS NULL) thì unique index sẽ fail.
        // Soft-delete các bản ghi trùng, giữ lại 1 record active duy nhất theo thứ tự CREATED_AT, ID.
        await queryRunner.query(`
            MERGE INTO BML_PIVKA_RESULTS r
            USING (
                SELECT ID FROM (
                    SELECT
                        ID,
                        ROW_NUMBER() OVER (
                            PARTITION BY STORED_SR_SERVICES_ID
                            ORDER BY CREATED_AT, ID
                        ) AS RN
                    FROM BML_PIVKA_RESULTS
                    WHERE DELETED_AT IS NULL
                )
                WHERE RN > 1
            ) s
            ON (r.ID = s.ID)
            WHEN MATCHED THEN
                UPDATE SET r.DELETED_AT = SYSTIMESTAMP
        `);

        await queryRunner.query(`
            CREATE UNIQUE INDEX UX_BML_PIVKA_RESULTS_ACTIVE
            ON BML_PIVKA_RESULTS (
                CASE WHEN DELETED_AT IS NULL THEN STORED_SR_SERVICES_ID END
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX UX_BML_PIVKA_RESULTS_ACTIVE`);
    }
}

