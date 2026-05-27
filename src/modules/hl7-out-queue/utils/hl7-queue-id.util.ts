/**
 * Chuyển PK RAW(16) ↔ hex 32 ký tự cho API.
 */
export function bufferToHex(id: Buffer): string {
    return id.toString('hex').toUpperCase();
}

export function hexToBuffer(hex: string): Buffer {
    const normalized = hex.trim().replace(/-/g, '');
    if (!/^[0-9a-fA-F]{32}$/.test(normalized)) {
        throw new Error('Invalid HL7 queue id: expected 32 hex characters');
    }
    return Buffer.from(normalized, 'hex');
}
