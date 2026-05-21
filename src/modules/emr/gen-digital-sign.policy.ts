import { ConfigService } from '@nestjs/config';

/** Form Gen (form-gen-1) — khớp RESULT_FORM_TYPE trên department. */
export const RESULT_FORM_TYPE_GEN = 2;

export const GEN_DIGITAL_SIGN_FORBIDDEN_MESSAGE =
    'Chỉ tài khoản được phép mới ký số phiếu kết quả Gen. Vui lòng liên hệ quản trị.';

const DEFAULT_ALLOWED_USERNAMES = ['ntl32', 'bbm'];

export function parseGenDigitalSignAllowedUsernames(
    raw: string | undefined,
): ReadonlySet<string> {
    const source =
        raw?.trim() ||
        process.env.GEN_DIGITAL_SIGN_ALLOWED_USERNAMES?.trim() ||
        DEFAULT_ALLOWED_USERNAMES.join(',');
    const set = new Set<string>();
    for (const part of source.split(',')) {
        const u = part.trim().toLowerCase();
        if (u) set.add(u);
    }
    return set;
}

export function isUsernameAllowedForGenDigitalSign(
    username: string | undefined,
    allowed: ReadonlySet<string>,
): boolean {
    const u = username?.trim().toLowerCase();
    return !!u && allowed.has(u);
}

export function getGenDigitalSignAllowedUsernames(
    configService?: ConfigService,
): ReadonlySet<string> {
    const raw = configService?.get<string>('GEN_DIGITAL_SIGN_ALLOWED_USERNAMES');
    return parseGenDigitalSignAllowedUsernames(raw);
}
