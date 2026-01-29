/**
 * Kiểm tra lỗi unique constraint (ORA-00001, 23505, 23000, …).
 * Hỗ trợ cả error gốc và TypeORM driverError.
 */
export function isUniqueConstraintError(err: unknown): boolean {
    const e = err as any;
    const msg = typeof e?.message === 'string' ? e.message : '';
    const code = e?.code;
    const driver = e?.driverError;
    const driverMsg = typeof driver?.message === 'string' ? driver.message : '';
    const driverCode = driver?.code;

    if (
        code === 'ORA-00001' ||
        code === '23505' ||
        code === '23000' ||
        driverCode === 'ORA-00001' ||
        driverCode === '23505' ||
        driverCode === '23000'
    ) {
        return true;
    }
    const s = msg || driverMsg;
    return (
        s.includes('ORA-00001') ||
        s.includes('unique constraint') ||
        s.includes('duplicate key')
    );
}
