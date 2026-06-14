import { MigrationInterface, QueryRunner } from 'typeorm';
import { randomUUID } from 'crypto';

/**
 * Nhân bản phòng làm việc cho cơ sở Ninh Bình (cơ sở 2).
 *
 * Yêu cầu biến môi trường:
 *   PRIMARY_HIS_BRANCH_ID    = HIS_BRANCH.ID của cơ sở 1
 *   NINH_BINH_HIS_BRANCH_ID  = HIS_BRANCH.ID của cơ sở Ninh Bình
 *
 * Các bước:
 *  1. Nới rộng ROOM_CODE lên 30 ký tự để chứa hậu tố '-NB'.
 *  2. Backfill HIS_BRANCH_ID = cơ sở 1 cho các phòng hiện có (đang NULL).
 *  3. Tạo bản sao cho cơ sở Ninh Bình: ROOM_CODE + '-NB', ROOM_NAME + ' - CSNB',
 *     giữ nguyên DEPARTMENT_ID và SELECT_PREFIX, HIS_BRANCH_ID = Ninh Bình.
 */
export class DuplicateRoomsForNinhBinhBranch1740000001600
    implements MigrationInterface
{
    name = 'DuplicateRoomsForNinhBinhBranch1740000001600';

    private static readonly ROOM_NAME_SUFFIX = ' - CSNB';
    private static readonly ROOM_CODE_SUFFIX = '-NB';

    private parseBranchId(value: string | undefined): number | undefined {
        if (value === undefined || value.trim() === '') return undefined;
        const n = Number(value);
        return Number.isFinite(n) ? n : undefined;
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        const primaryBranchId = this.parseBranchId(process.env.PRIMARY_HIS_BRANCH_ID);
        const ninhBinhBranchId = this.parseBranchId(process.env.NINH_BINH_HIS_BRANCH_ID);

        if (primaryBranchId === undefined || ninhBinhBranchId === undefined) {
            throw new Error(
                'DuplicateRoomsForNinhBinhBranch: cần đặt PRIMARY_HIS_BRANCH_ID và NINH_BINH_HIS_BRANCH_ID trong .env trước khi chạy migration này.',
            );
        }

        // 1. Nới rộng ROOM_CODE để chứa hậu tố
        await queryRunner.query(`ALTER TABLE BML_ROOMS MODIFY (ROOM_CODE VARCHAR2(30))`);

        // 2. Backfill cơ sở 1 cho phòng hiện có chưa có cơ sở
        await queryRunner.query(
            `UPDATE BML_ROOMS SET HIS_BRANCH_ID = :1 WHERE HIS_BRANCH_ID IS NULL AND DELETED_AT IS NULL`,
            [primaryBranchId],
        );

        // 3. Nhân bản phòng cơ sở 1 -> cơ sở Ninh Bình
        const rooms: any[] = await queryRunner.query(
            `SELECT ID, ROOM_CODE, ROOM_NAME, ROOM_ADDRESS, DEPARTMENT_ID, DESCRIPTION,
                    SELECT_PREFIX, IS_ACTIVE, SORT_ORDER
             FROM BML_ROOMS
             WHERE HIS_BRANCH_ID = :1 AND DELETED_AT IS NULL`,
            [primaryBranchId],
        );

        for (const room of rooms) {
            const newRoomCode =
                `${room.ROOM_CODE}${DuplicateRoomsForNinhBinhBranch1740000001600.ROOM_CODE_SUFFIX}`;
            const newRoomName =
                `${room.ROOM_NAME}${DuplicateRoomsForNinhBinhBranch1740000001600.ROOM_NAME_SUFFIX}`;

            // Bỏ qua nếu bản sao đã tồn tại (idempotent)
            const existing = await queryRunner.query(
                `SELECT COUNT(1) AS "cnt" FROM BML_ROOMS WHERE ROOM_CODE = :1`,
                [newRoomCode],
            );
            if (Number(existing[0]?.cnt ?? existing[0]?.CNT ?? 0) > 0) {
                continue;
            }

            await queryRunner.query(
                `INSERT INTO BML_ROOMS
                    (ID, ROOM_CODE, ROOM_NAME, ROOM_ADDRESS, DEPARTMENT_ID, DESCRIPTION,
                     SELECT_PREFIX, IS_ACTIVE, SORT_ORDER, HIS_BRANCH_ID,
                     CREATED_AT, UPDATED_AT, VERSION)
                 VALUES
                    (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10, SYSTIMESTAMP, SYSTIMESTAMP, 1)`,
                [
                    randomUUID(),
                    newRoomCode,
                    newRoomName,
                    room.ROOM_ADDRESS ?? null,
                    room.DEPARTMENT_ID,
                    room.DESCRIPTION ?? null,
                    room.SELECT_PREFIX ?? null,
                    room.IS_ACTIVE ?? 1,
                    room.SORT_ORDER ?? 0,
                    ninhBinhBranchId,
                ],
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const ninhBinhBranchId = this.parseBranchId(process.env.NINH_BINH_HIS_BRANCH_ID);
        if (ninhBinhBranchId !== undefined) {
            // Xóa các phòng nhân bản cho Ninh Bình (theo hậu tố mã + cơ sở)
            await queryRunner.query(
                `DELETE FROM BML_ROOMS
                 WHERE HIS_BRANCH_ID = :1
                   AND ROOM_CODE LIKE '%${DuplicateRoomsForNinhBinhBranch1740000001600.ROOM_CODE_SUFFIX}'`,
                [ninhBinhBranchId],
            );
        }
    }
}
