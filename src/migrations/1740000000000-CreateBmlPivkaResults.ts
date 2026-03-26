import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Bảng kết quả PIVKA-II / AFP (đồng bộ cột với BaseEntity).
 */
export class CreateBmlPivkaResults1740000000000 implements MigrationInterface {
    name = 'CreateBmlPivkaResults1740000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE BML_PIVKA_RESULTS (
                ID VARCHAR2(36) NOT NULL,
                CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                DELETED_AT TIMESTAMP NULL,
                CREATED_BY VARCHAR2(50) NULL,
                UPDATED_BY VARCHAR2(50) NULL,
                VERSION NUMBER DEFAULT 1 NOT NULL,
                -- Kết quả số thập phân gửi từ FE thường là chuỗi dạng "0.12", "<=0.1", ">10"...
                PIVKA_II_RESULT VARCHAR2(50) NULL,
                AFP_FULL_RESULT VARCHAR2(50) NULL,
                AFP_L3 VARCHAR2(50) NULL,
                STORED_SR_SERVICES_ID VARCHAR2(36) NOT NULL,
                CONSTRAINT PK_BML_PIVKA_RESULTS PRIMARY KEY (ID),
                CONSTRAINT FK_BML_PIVKA_RSLT_SR_SRV FOREIGN KEY (STORED_SR_SERVICES_ID)
                    REFERENCES BML_STORED_SR_SERVICES (ID) ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE BML_PIVKA_RESULTS`);
    }
}
