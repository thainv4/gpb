import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Thêm STORED_SR_SERVICES_ID (FK → BML_STORED_SR_SERVICES.ID) khi bảng đã tồn tại từ migration cũ (chưa có cột).
 * Migration CreateBmlPivkaResults mới đã gộp cột + FK: trường hợp đó sẽ bỏ qua các bước ở đây.
 */
export class AddStoredSrServicesIdToBmlPivkaResults1740000000600 implements MigrationInterface {
    name = 'AddStoredSrServicesIdToBmlPivkaResults1740000000600';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const rows = await queryRunner.query(`
            SELECT COUNT(1) AS "cnt" FROM user_tab_columns
            WHERE table_name = 'BML_PIVKA_RESULTS' AND column_name = 'STORED_SR_SERVICES_ID'
        `);
        const cnt = Number(rows[0]?.cnt ?? rows[0]?.CNT ?? 0);
        if (cnt > 0) {
            return;
        }

        await queryRunner.query(`
            ALTER TABLE BML_PIVKA_RESULTS ADD (
                STORED_SR_SERVICES_ID VARCHAR2(36) NULL
            )
        `);
        await queryRunner.query(`
            ALTER TABLE BML_PIVKA_RESULTS
            ADD CONSTRAINT FK_BML_PIVKA_RSLT_SR_SRV FOREIGN KEY (STORED_SR_SERVICES_ID)
            REFERENCES BML_STORED_SR_SERVICES (ID) ON DELETE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE BML_PIVKA_RESULTS MODIFY (STORED_SR_SERVICES_ID NOT NULL)
        `);
    }

    public async down(): Promise<void> {
        // Chỉ hỗ trợ nâng cấp từ bảng cũ; không revert tự động (tránh gỡ nhầm FK từ CreateBmlPivkaResults).
    }
}
