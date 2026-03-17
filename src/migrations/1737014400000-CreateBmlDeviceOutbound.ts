import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Tạo bảng BML_DEVICE_OUTBOUND - dữ liệu xuất ra thiết bị (máy nhuộm, máy quét...).
 * Block_ID = RECEPTION_CODE + 'A.' + blockNumber, SLIDE_ID = RECEPTION_CODE + 'A.' + blockNumber + '.' + slideNumber.
 */
export class CreateBmlDeviceOutbound1737014400000 implements MigrationInterface {
    name = 'CreateBmlDeviceOutbound1737014400000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE BML_DEVICE_OUTBOUND (
                ID VARCHAR2(36) NOT NULL,
                CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                DELETED_AT TIMESTAMP NULL,
                CREATED_BY VARCHAR2(50) NULL,
                UPDATED_BY VARCHAR2(50) NULL,
                VERSION NUMBER DEFAULT 1 NOT NULL,
                RECEPTION_CODE VARCHAR2(50) NOT NULL,
                SERVICE_CODE VARCHAR2(50) NOT NULL,
                BLOCK_ID VARCHAR2(100) NOT NULL,
                SLIDE_ID VARCHAR2(100) NOT NULL,
                METHOD VARCHAR2(50) NOT NULL,
                CONSTRAINT PK_BML_DEVOUT PRIMARY KEY (ID)
            )
        `);
        await queryRunner.query(`CREATE INDEX IDX_BML_DEVOUT_REC ON BML_DEVICE_OUTBOUND (RECEPTION_CODE)`);
        await queryRunner.query(`CREATE INDEX IDX_BML_DEVOUT_SVC ON BML_DEVICE_OUTBOUND (SERVICE_CODE)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IDX_BML_DEVOUT_SVC`);
        await queryRunner.query(`DROP INDEX IDX_BML_DEVOUT_REC`);
        await queryRunner.query(`DROP TABLE BML_DEVICE_OUTBOUND`);
    }
}
