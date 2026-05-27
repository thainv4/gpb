/**
 * Parse patient DOB stored as HIS numeric (YYYYMMDD or longer e.g. YYYYMMDDHHmmss).
 */
export function parsePatientDobFromNumber(value?: number | null): Date | undefined {
    if (value == null || Number.isNaN(value)) {
        return undefined;
    }
    const digits = String(Math.trunc(value));
    if (digits.length < 8) {
        return undefined;
    }
    const ymd = digits.slice(0, 8);
    const year = Number(ymd.slice(0, 4));
    const month = Number(ymd.slice(4, 6));
    const day = Number(ymd.slice(6, 8));
    if (month < 1 || month > 12 || day < 1 || day > 31) {
        return undefined;
    }
    const date = new Date(year, month - 1, day);
    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return undefined;
    }
    return date;
}
