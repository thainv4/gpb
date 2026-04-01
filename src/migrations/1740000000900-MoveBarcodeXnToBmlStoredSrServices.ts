import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Chuyển BARCODE_XN từ BML_STORED_SERVICE_REQUESTS sang BML_STORED_SR_SERVICES;
 * thêm TEST_INDEX_CODE (chuỗi mã chỉ số, có thể nhiều mã cách nhau dấu phẩy).
 */
export class MoveBarcodeXnToBmlStoredSrServices1740000000900
    implements MigrationInterface {
    name = 'MoveBarcodeXnToBmlStoredSrServices1740000000900';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const reqRows = await queryRunner.query(`
            SELECT COUNT(1) AS "cnt"
            FROM user_tab_columns
            WHERE table_name = 'BML_STORED_SERVICE_REQUESTS'
              AND column_name = 'BARCODE_XN'
        `);
        const hasReqBarcode = Number(reqRows[0]?.cnt ?? reqRows[0]?.CNT ?? 0) > 0;

        const srvBcRows = await queryRunner.query(`
            SELECT COUNT(1) AS "cnt"
            FROM user_tab_columns
            WHERE table_name = 'BML_STORED_SR_SERVICES'
              AND column_name = 'BARCODE_XN'
        `);
        if (Number(srvBcRows[0]?.cnt ?? srvBcRows[0]?.CNT ?? 0) === 0) {
            await queryRunner.query(`
                ALTER TABLE BML_STORED_SR_SERVICES
                ADD (BARCODE_XN VARCHAR2(50) NULL)
            `);
        }

        const srvTiRows = await queryRunner.query(`
            SELECT COUNT(1) AS "cnt"
            FROM user_tab_columns
            WHERE table_name = 'BML_STORED_SR_SERVICES'
              AND column_name = 'TEST_INDEX_CODE'
        `);
        if (Number(srvTiRows[0]?.cnt ?? srvTiRows[0]?.CNT ?? 0) === 0) {
            await queryRunner.query(`
                ALTER TABLE BML_STORED_SR_SERVICES
                ADD (TEST_INDEX_CODE VARCHAR2(1000) NULL)
            `);
        }

        if (hasReqBarcode) {
            await queryRunner.query(`
                UPDATE BML_STORED_SR_SERVICES s
                SET s.BARCODE_XN = (
                    SELECT r.BARCODE_XN
                    FROM BML_STORED_SERVICE_REQUESTS r
                    WHERE r.ID = s.STORED_SERVICE_REQ_ID
                )
                WHERE s.IS_CHILD_SERVICE = 0
            `);

            await queryRunner.query(`
                ALTER TABLE BML_STORED_SERVICE_REQUESTS
                DROP COLUMN BARCODE_XN
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const reqRows = await queryRunner.query(`
            SELECT COUNT(1) AS "cnt"
            FROM user_tab_columns
            WHERE table_name = 'BML_STORED_SERVICE_REQUESTS'
              AND column_name = 'BARCODE_XN'
        `);
        if (Number(reqRows[0]?.cnt ?? reqRows[0]?.CNT ?? 0) === 0) {
            await queryRunner.query(`
                ALTER TABLE BML_STORED_SERVICE_REQUESTS
                ADD (BARCODE_XN VARCHAR2(50) NULL)
            `);
        }

        await queryRunner.query(`
            UPDATE BML_STORED_SERVICE_REQUESTS r
            SET r.BARCODE_XN = (
                SELECT MAX(s.BARCODE_XN)
                FROM BML_STORED_SR_SERVICES s
                WHERE s.STORED_SERVICE_REQ_ID = r.ID
                  AND s.IS_CHILD_SERVICE = 0
            )
        `);

        const srvBcRows = await queryRunner.query(`
            SELECT COUNT(1) AS "cnt"
            FROM user_tab_columns
            WHERE table_name = 'BML_STORED_SR_SERVICES'
              AND column_name = 'BARCODE_XN'
        `);
        if (Number(srvBcRows[0]?.cnt ?? srvBcRows[0]?.CNT ?? 0) > 0) {
            await queryRunner.query(`
                ALTER TABLE BML_STORED_SR_SERVICES
                DROP COLUMN BARCODE_XN
            `);
        }

        const srvTiRows = await queryRunner.query(`
            SELECT COUNT(1) AS "cnt"
            FROM user_tab_columns
            WHERE table_name = 'BML_STORED_SR_SERVICES'
              AND column_name = 'TEST_INDEX_CODE'
        `);
        if (Number(srvTiRows[0]?.cnt ?? srvTiRows[0]?.CNT ?? 0) > 0) {
            await queryRunner.query(`
                ALTER TABLE BML_STORED_SR_SERVICES
                DROP COLUMN TEST_INDEX_CODE
            `);
        }
    }
}
