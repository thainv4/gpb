/**
 * Format PATIENT_DOB (Date or Oracle/TypeORM string) to YYYY-MM-DD for API responses.
 */
export function formatPatientDobForApi(date?: Date | string | null): string | null {
    if (date == null) {
        return null;
    }

    if (typeof date === 'string') {
        const trimmed = date.trim();
        if (!trimmed) {
            return null;
        }
        if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
            return trimmed.slice(0, 10);
        }
        const parsed = new Date(trimmed);
        if (Number.isNaN(parsed.getTime())) {
            return null;
        }
        date = parsed;
    }

    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD to Date at local midnight (date-only).
 */
export function parsePatientDobFromApi(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
}
