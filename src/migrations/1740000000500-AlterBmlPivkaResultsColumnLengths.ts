import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Giảm độ dài VARCHAR2 cho 3 cột kết quả (FE gửi số thập phân dạng chuỗi).
 */
export class AlterBmlPivkaResultsColumnLengths1740000000500
    implements MigrationInterface {
    name = 'AlterBmlPivkaResultsColumnLengths1740000000500';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Nếu bảng chưa tồn tại thì bỏ qua (để không làm hỏng chuỗi migration ở môi trường khác).
        await queryRunner.query(`
            BEGIN
                EXECUTE IMMEDIATE 'ALTER TABLE BML_PIVKA_RESULTS MODIFY (
                    PIVKA_II_RESULT VARCHAR2(50),
                    AFP_FULL_RESULT VARCHAR2(50),
                    AFP_L3 VARCHAR2(50)
                )';
            EXCEPTION
                WHEN OTHERS THEN
                    IF SQLCODE = -942 THEN NULL; ELSE RAISE; END IF;
            END;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            BEGIN
                EXECUTE IMMEDIATE 'ALTER TABLE BML_PIVKA_RESULTS MODIFY (
                    PIVKA_II_RESULT VARCHAR2(500),
                    AFP_FULL_RESULT VARCHAR2(500),
                    AFP_L3 VARCHAR2(500)
                )';
            EXCEPTION
                WHEN OTHERS THEN
                    IF SQLCODE = -942 THEN NULL; ELSE RAISE; END IF;
            END;
        `);
    }
}

