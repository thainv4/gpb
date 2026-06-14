import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Thêm cột HIS_BRANCH_ID (tham chiếu HIS_BRANCH.ID bên DB HIS) vào:
 *  - BML_ROOMS: phòng làm việc thuộc cơ sở nào
 *  - BML_STORED_SERVICE_REQUESTS: y lệnh đã lưu thuộc cơ sở nào (ghi lúc tiếp nhận)
 *
 * Không tạo FK vì HIS_BRANCH nằm ở database HIS (khác schema/connection).
 */
export class AddHisBranchIdToRoomsAndStoredServiceRequests1740000001500
    implements MigrationInterface
{
    name = 'AddHisBranchIdToRoomsAndStoredServiceRequests1740000001500';

    private async columnExists(
        queryRunner: QueryRunner,
        tableName: string,
        columnName: string,
    ): Promise<boolean> {
        const rows = await queryRunner.query(`
            SELECT COUNT(1) AS "cnt"
            FROM user_tab_columns
            WHERE table_name = '${tableName}'
              AND column_name = '${columnName}'
        `);
        return Number(rows[0]?.cnt ?? rows[0]?.CNT ?? 0) > 0;
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await this.columnExists(queryRunner, 'BML_ROOMS', 'HIS_BRANCH_ID'))) {
            await queryRunner.query(`
                ALTER TABLE BML_ROOMS
                ADD (HIS_BRANCH_ID NUMBER NULL)
            `);
        }

        if (
            !(await this.columnExists(
                queryRunner,
                'BML_STORED_SERVICE_REQUESTS',
                'HIS_BRANCH_ID',
            ))
        ) {
            await queryRunner.query(`
                ALTER TABLE BML_STORED_SERVICE_REQUESTS
                ADD (HIS_BRANCH_ID NUMBER NULL)
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await this.columnExists(queryRunner, 'BML_STORED_SERVICE_REQUESTS', 'HIS_BRANCH_ID')) {
            await queryRunner.query(`
                ALTER TABLE BML_STORED_SERVICE_REQUESTS
                DROP COLUMN HIS_BRANCH_ID
            `);
        }

        if (await this.columnExists(queryRunner, 'BML_ROOMS', 'HIS_BRANCH_ID')) {
            await queryRunner.query(`
                ALTER TABLE BML_ROOMS
                DROP COLUMN HIS_BRANCH_ID
            `);
        }
    }
}
