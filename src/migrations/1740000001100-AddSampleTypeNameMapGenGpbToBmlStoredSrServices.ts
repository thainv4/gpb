import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Thêm cột SAMPLE_TYPE_NAME_MAP_GEN_GPB vào BML_STORED_SR_SERVICES.
 */
export class AddSampleTypeNameMapGenGpbToBmlStoredSrServices1740000001100
    implements MigrationInterface {
    name = 'AddSampleTypeNameMapGenGpbToBmlStoredSrServices1740000001100';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const rows = await queryRunner.query(`
            SELECT COUNT(1) AS "cnt"
            FROM user_tab_columns
            WHERE table_name = 'BML_STORED_SR_SERVICES'
              AND column_name = 'SAMPLE_TYPE_NAME_MAP_GEN_GPB'
        `);
        const cnt = Number(rows[0]?.cnt ?? rows[0]?.CNT ?? 0);
        if (cnt > 0) {
            return;
        }

        await queryRunner.query(`
            ALTER TABLE BML_STORED_SR_SERVICES
            ADD (SAMPLE_TYPE_NAME_MAP_GEN_GPB VARCHAR2(200) NULL)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const rows = await queryRunner.query(`
            SELECT COUNT(1) AS "cnt"
            FROM user_tab_columns
            WHERE table_name = 'BML_STORED_SR_SERVICES'
              AND column_name = 'SAMPLE_TYPE_NAME_MAP_GEN_GPB'
        `);
        const cnt = Number(rows[0]?.cnt ?? rows[0]?.CNT ?? 0);
        if (cnt === 0) {
            return;
        }

        await queryRunner.query(`
            ALTER TABLE BML_STORED_SR_SERVICES
            DROP COLUMN SAMPLE_TYPE_NAME_MAP_GEN_GPB
        `);
    }
}

