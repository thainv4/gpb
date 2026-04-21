import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Bảng phương pháp nhuộm theo thiết bị — cấu trúc giống BML_STAINING_METHOD.
 */
export class CreateBmlDeviceStainingMethod1740000001200 implements MigrationInterface {
    name = 'CreateBmlDeviceStainingMethod1740000001200';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE BML_DEVICE_STAINING_METHOD (
                ID VARCHAR2(36) NOT NULL,
                CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                DELETED_AT TIMESTAMP NULL,
                CREATED_BY VARCHAR2(50) NULL,
                UPDATED_BY VARCHAR2(50) NULL,
                VERSION NUMBER DEFAULT 1 NOT NULL,
                METHOD_NAME NVARCHAR2(50) NOT NULL,
                PROTOCOL_NO VARCHAR2(100) NOT NULL,
                CONSTRAINT PK_BML_DEVICE_STAINING_METHOD PRIMARY KEY (ID)
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE BML_DEVICE_STAINING_METHOD`);
    }
}
