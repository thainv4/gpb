import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Thêm cột SAMPLE_TYPE_ID (FK → BML_SAMPLE_TYPES) vào BML_STORED_SR_SERVICES.
 */
export class AddSampleTypeIdToBmlStoredSrServices1740000001300
    implements MigrationInterface
{
    name = 'AddSampleTypeIdToBmlStoredSrServices1740000001300';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const rows = await queryRunner.query(`
            SELECT COUNT(1) AS "cnt"
            FROM user_tab_columns
            WHERE table_name = 'BML_STORED_SR_SERVICES'
              AND column_name = 'SAMPLE_TYPE_ID'
        `);
        const cnt = Number(rows[0]?.cnt ?? rows[0]?.CNT ?? 0);
        if (cnt > 0) {
            return;
        }

        await queryRunner.query(`
            ALTER TABLE BML_STORED_SR_SERVICES
            ADD (SAMPLE_TYPE_ID VARCHAR2(36) NULL)
        `);

        await queryRunner.query(`
            ALTER TABLE BML_STORED_SR_SERVICES
            ADD CONSTRAINT FK_SSR_SRV_SAMPLE_TYPE
            FOREIGN KEY (SAMPLE_TYPE_ID) REFERENCES BML_SAMPLE_TYPES (ID)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const colRows = await queryRunner.query(`
            SELECT COUNT(1) AS "cnt"
            FROM user_tab_columns
            WHERE table_name = 'BML_STORED_SR_SERVICES'
              AND column_name = 'SAMPLE_TYPE_ID'
        `);
        const colCnt = Number(colRows[0]?.cnt ?? colRows[0]?.CNT ?? 0);
        if (colCnt === 0) {
            return;
        }

        await queryRunner.query(`
            ALTER TABLE BML_STORED_SR_SERVICES
            DROP CONSTRAINT FK_SSR_SRV_SAMPLE_TYPE
        `);

        await queryRunner.query(`
            ALTER TABLE BML_STORED_SR_SERVICES
            DROP COLUMN SAMPLE_TYPE_ID
        `);
    }
}
