/**
 * Cấu hình phân chia cơ sở (Bạch Mai cơ sở 1 và cơ sở Ninh Bình).
 *
 * Cơ sở thật nằm ở bảng HIS_BRANCH (DB HIS). GPB chỉ tham chiếu HIS_BRANCH.ID.
 * ID cụ thể của 2 cơ sở khác nhau giữa các môi trường nên đọc từ biến môi trường.
 *
 * Cần đặt trong .env trước khi chạy:
 *   PRIMARY_HIS_BRANCH_ID=<HIS_BRANCH.ID của cơ sở 1>
 *   NINH_BINH_HIS_BRANCH_ID=<HIS_BRANCH.ID của cơ sở Ninh Bình>
 */

function parseEnvNumber(value: string | undefined): number | undefined {
    if (value === undefined || value.trim() === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

/** HIS_BRANCH.ID của cơ sở 1 (cơ sở chính). */
export const PRIMARY_HIS_BRANCH_ID = parseEnvNumber(process.env.PRIMARY_HIS_BRANCH_ID);

/** HIS_BRANCH.ID của cơ sở Ninh Bình (cơ sở 2). */
export const NINH_BINH_HIS_BRANCH_ID = parseEnvNumber(process.env.NINH_BINH_HIS_BRANCH_ID);

/** Hậu tố thêm vào tên phòng nhân bản cho cơ sở Ninh Bình. */
export const NINH_BINH_ROOM_NAME_SUFFIX = ' - CSNB';

/** Hậu tố thêm vào roomCode khi nhân bản phòng cho cơ sở Ninh Bình. */
export const NINH_BINH_ROOM_CODE_SUFFIX = '-NB';

/**
 * Kiểm tra một cơ sở có phải Ninh Bình (cơ sở 2) hay không.
 * Dùng để quyết định barcode có thêm '2' vào sau prefix.
 */
export function isNinhBinhBranch(hisBranchId: number | undefined | null): boolean {
    if (hisBranchId === undefined || hisBranchId === null) return false;
    if (NINH_BINH_HIS_BRANCH_ID === undefined) return false;
    return Number(hisBranchId) === NINH_BINH_HIS_BRANCH_ID;
}
