export interface SplitPersonNameResult {
    family: string;
    given: string;
}

/**
 * Tách họ / tên: token đầu = family, phần còn lại = given.
 */
export function splitPersonName(fullName?: string | null): SplitPersonNameResult {
    const trimmed = fullName?.trim() ?? '';
    if (!trimmed) {
        return { family: '', given: '' };
    }
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) {
        return { family: parts[0], given: '' };
    }
    return {
        family: parts[0],
        given: parts.slice(1).join(' '),
    };
}
