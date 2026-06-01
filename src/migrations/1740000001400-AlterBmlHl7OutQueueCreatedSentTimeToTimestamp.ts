import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Đổi CREATED_TIME, SENT_TIME trên BML_HL7_OUT_QUEUE từ DATE sang TIMESTAMP
 * để lưu đủ ngày giờ (đồng bộ TypeORM type: 'timestamp').
 */
export class AlterBmlHl7OutQueueCreatedSentTimeToTimestamp1740000001400
    implements MigrationInterface
{
    name = 'AlterBmlHl7OutQueueCreatedSentTimeToTimestamp1740000001400';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableRows = await queryRunner.query(`
            SELECT COUNT(1) AS "cnt"
            FROM user_tables
            WHERE table_name = 'BML_HL7_OUT_QUEUE'
        `);
        const tableCnt = Number(tableRows[0]?.cnt ?? tableRows[0]?.CNT ?? 0);
        if (tableCnt === 0) {
            return;
        }

        const colRows = await queryRunner.query(`
            SELECT data_type AS "dataType"
            FROM user_tab_columns
            WHERE table_name = 'BML_HL7_OUT_QUEUE'
              AND column_name = 'CREATED_TIME'
        `);
        const dataType = String(colRows[0]?.dataType ?? colRows[0]?.DATATYPE ?? '').toUpperCase();
        if (dataType === 'TIMESTAMP' || dataType.startsWith('TIMESTAMP')) {
            return;
        }

        await queryRunner.query(`
            ALTER TABLE BML_HL7_OUT_QUEUE MODIFY (
                CREATED_TIME TIMESTAMP DEFAULT SYSTIMESTAMP,
                SENT_TIME TIMESTAMP
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableRows = await queryRunner.query(`
            SELECT COUNT(1) AS "cnt"
            FROM user_tables
            WHERE table_name = 'BML_HL7_OUT_QUEUE'
        `);
        const tableCnt = Number(tableRows[0]?.cnt ?? tableRows[0]?.CNT ?? 0);
        if (tableCnt === 0) {
            return;
        }

        const colRows = await queryRunner.query(`
            SELECT data_type AS "dataType"
            FROM user_tab_columns
            WHERE table_name = 'BML_HL7_OUT_QUEUE'
              AND column_name = 'CREATED_TIME'
        `);
        const dataType = String(colRows[0]?.dataType ?? colRows[0]?.DATATYPE ?? '').toUpperCase();
        if (dataType === 'DATE') {
            return;
        }

        await queryRunner.query(`
            ALTER TABLE BML_HL7_OUT_QUEUE MODIFY (
                CREATED_TIME DATE DEFAULT SYSDATE,
                SENT_TIME DATE
            )
        `);
    }
}
