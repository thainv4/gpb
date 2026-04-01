import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Thêm cột BARCODE_XN vào BML_STORED_SERVICE_REQUESTS để lưu barcodeXn khi POST /service-requests/store.
 */
export class AddBarcodeXnToBmlStoredServiceRequests1740000000800
    implements MigrationInterface {
    name = 'AddBarcodeXnToBmlStoredServiceRequests1740000000800';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const rows = await queryRunner.query(`
            SELECT COUNT(1) AS "cnt"
            FROM user_tab_columns
            WHERE table_name = 'BML_STORED_SERVICE_REQUESTS'
              AND column_name = 'BARCODE_XN'
        `);
        const cnt = Number(rows[0]?.cnt ?? rows[0]?.CNT ?? 0);
        if (cnt > 0) {
            return;
        }

        await queryRunner.query(`
            ALTER TABLE BML_STORED_SERVICE_REQUESTS
            ADD (BARCODE_XN VARCHAR2(50) NULL)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const rows = await queryRunner.query(`
            SELECT COUNT(1) AS "cnt"
            FROM user_tab_columns
            WHERE table_name = 'BML_STORED_SERVICE_REQUESTS'
              AND column_name = 'BARCODE_XN'
        `);
        const cnt = Number(rows[0]?.cnt ?? rows[0]?.CNT ?? 0);
        if (cnt === 0) {
            return;
        }

        await queryRunner.query(`
            ALTER TABLE BML_STORED_SERVICE_REQUESTS
            DROP COLUMN BARCODE_XN
        `);
    }
}

