import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Nhật ký tác động phiếu / dịch vụ (append-only, độc lập workflow history).
 */
export class CreateBmlSrAuditLog1740000001000 implements MigrationInterface {
    name = 'CreateBmlSrAuditLog1740000001000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE BML_SR_AUDIT_LOG (
                ID VARCHAR2(36) NOT NULL,
                CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                DELETED_AT TIMESTAMP NULL,
                CREATED_BY VARCHAR2(50) NULL,
                UPDATED_BY VARCHAR2(50) NULL,
                VERSION NUMBER DEFAULT 1 NOT NULL,
                OCCURRED_AT TIMESTAMP NOT NULL,
                EVENT_CATEGORY VARCHAR2(20) NOT NULL,
                EVENT_CODE VARCHAR2(50) NOT NULL,
                EVENT_TITLE VARCHAR2(200) NOT NULL,
                SUMMARY VARCHAR2(1000) NULL,
                NOTES VARCHAR2(1000) NULL,
                PAYLOAD CLOB NULL,
                SCOPE VARCHAR2(10) NOT NULL,
                STORED_SERVICE_REQ_ID VARCHAR2(36) NOT NULL,
                STORED_SERVICE_ID VARCHAR2(36) NULL,
                ACTION_USER_ID VARCHAR2(36) NOT NULL,
                ACTION_USERNAME VARCHAR2(50) NULL,
                ACTION_USER_FULL_NAME VARCHAR2(200) NULL,
                ACTION_ROOM_ID VARCHAR2(36) NULL,
                ACTION_ROOM_NAME VARCHAR2(200) NULL,
                SERVICE_REQ_CODE VARCHAR2(50) NULL,
                HIS_SERVICE_REQ_CODE VARCHAR2(50) NULL,
                RECEPTION_CODE VARCHAR2(50) NULL,
                PATIENT_CODE VARCHAR2(50) NULL,
                PATIENT_NAME VARCHAR2(200) NULL,
                SERVICE_NAME VARCHAR2(500) NULL,
                CORRELATION_ID VARCHAR2(36) NULL,
                CONSTRAINT PK_BML_SR_AUDIT_LOG PRIMARY KEY (ID)
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IDX_SR_AUDIT_SVC_RESULT
            ON BML_SR_AUDIT_LOG (STORED_SERVICE_ID, EVENT_CODE, OCCURRED_AT DESC)
        `);
        await queryRunner.query(`
            CREATE INDEX IDX_SR_AUDIT_TIME ON BML_SR_AUDIT_LOG (OCCURRED_AT DESC)
        `);
        await queryRunner.query(`
            CREATE INDEX IDX_SR_AUDIT_ROOM_TIME
            ON BML_SR_AUDIT_LOG (ACTION_ROOM_ID, OCCURRED_AT DESC)
        `);
        await queryRunner.query(`
            CREATE INDEX IDX_SR_AUDIT_REQ_TIME
            ON BML_SR_AUDIT_LOG (STORED_SERVICE_REQ_ID, OCCURRED_AT DESC)
        `);
        await queryRunner.query(`
            CREATE INDEX IDX_SR_AUDIT_CODE ON BML_SR_AUDIT_LOG (SERVICE_REQ_CODE)
        `);
        await queryRunner.query(`
            CREATE INDEX IDX_SR_AUDIT_HIS_CODE ON BML_SR_AUDIT_LOG (HIS_SERVICE_REQ_CODE)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE BML_SR_AUDIT_LOG`);
    }
}
