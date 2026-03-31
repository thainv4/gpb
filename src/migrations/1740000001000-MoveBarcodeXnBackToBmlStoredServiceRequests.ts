import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Move BARCODE_XN về BML_STORED_SERVICE_REQUESTS:
 * - DROP BARCODE_XN khỏi BML_STORED_SR_SERVICES (parent service table).
 * - ADD/UPDATE BARCODE_XN vào BML_STORED_SERVICE_REQUESTS từ giá trị của parent service.
 */
export class MoveBarcodeXnBackToBmlStoredServiceRequests1740000001000
  implements MigrationInterface {
  name = 'MoveBarcodeXnBackToBmlStoredServiceRequests1740000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure BARCODE_XN exists on BML_STORED_SERVICE_REQUESTS
    const reqBcRows = await queryRunner.query(`
      SELECT COUNT(1) AS "cnt"
      FROM user_tab_columns
      WHERE table_name = 'BML_STORED_SERVICE_REQUESTS'
        AND column_name = 'BARCODE_XN'
    `);
    const hasReqBarcodeXn = Number(reqBcRows[0]?.cnt ?? reqBcRows[0]?.CNT ?? 0) > 0;

    if (!hasReqBarcodeXn) {
      await queryRunner.query(`
        ALTER TABLE BML_STORED_SERVICE_REQUESTS
        ADD (BARCODE_XN VARCHAR2(50) NULL)
      `);
    }

    // If BARCODE_XN exists on BML_STORED_SR_SERVICES, copy from parent rows
    const srvBcRows = await queryRunner.query(`
      SELECT COUNT(1) AS "cnt"
      FROM user_tab_columns
      WHERE table_name = 'BML_STORED_SR_SERVICES'
        AND column_name = 'BARCODE_XN'
    `);
    const hasSrvBarcodeXn = Number(srvBcRows[0]?.cnt ?? srvBcRows[0]?.CNT ?? 0) > 0;

    if (hasSrvBarcodeXn) {
      await queryRunner.query(`
        UPDATE BML_STORED_SERVICE_REQUESTS r
        SET r.BARCODE_XN = (
          SELECT MAX(s.BARCODE_XN)
          FROM BML_STORED_SR_SERVICES s
          WHERE s.STORED_SERVICE_REQ_ID = r.ID
            AND s.IS_CHILD_SERVICE = 0
        )
      `);

      await queryRunner.query(`
        ALTER TABLE BML_STORED_SR_SERVICES
        DROP COLUMN BARCODE_XN
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Ensure BARCODE_XN exists on BML_STORED_SR_SERVICES
    const srvBcRows = await queryRunner.query(`
      SELECT COUNT(1) AS "cnt"
      FROM user_tab_columns
      WHERE table_name = 'BML_STORED_SR_SERVICES'
        AND column_name = 'BARCODE_XN'
    `);
    const hasSrvBarcodeXn = Number(srvBcRows[0]?.cnt ?? srvBcRows[0]?.CNT ?? 0) > 0;

    if (!hasSrvBarcodeXn) {
      await queryRunner.query(`
        ALTER TABLE BML_STORED_SR_SERVICES
        ADD (BARCODE_XN VARCHAR2(50) NULL)
      `);
    }

    // Copy from request header back to parent service rows
    await queryRunner.query(`
      UPDATE BML_STORED_SR_SERVICES s
      SET s.BARCODE_XN = (
        SELECT r.BARCODE_XN
        FROM BML_STORED_SERVICE_REQUESTS r
        WHERE r.ID = s.STORED_SERVICE_REQ_ID
      )
      WHERE s.IS_CHILD_SERVICE = 0
    `);

    // Optionally drop from header if it exists
    const reqBcRows = await queryRunner.query(`
      SELECT COUNT(1) AS "cnt"
      FROM user_tab_columns
      WHERE table_name = 'BML_STORED_SERVICE_REQUESTS'
        AND column_name = 'BARCODE_XN'
    `);
    const hasReqBarcodeXn = Number(reqBcRows[0]?.cnt ?? reqBcRows[0]?.CNT ?? 0) > 0;

    if (hasReqBarcodeXn) {
      await queryRunner.query(`
        ALTER TABLE BML_STORED_SERVICE_REQUESTS
        DROP COLUMN BARCODE_XN
      `);
    }
  }
}

