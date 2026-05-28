import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

/**
 * Khi chạy trong runSuppressed(), các safeAppend audit bị bỏ qua
 * (dùng cho confirm-handover trước khi ghi một dòng SAMPLE_HANDOVER).
 */
@Injectable()
export class AuditSuppressContext {
    private readonly storage = new AsyncLocalStorage<{ suppressed: boolean }>();

    isSuppressed(): boolean {
        return this.storage.getStore()?.suppressed === true;
    }

    async runSuppressed<T>(fn: () => Promise<T>): Promise<T> {
        return this.storage.run({ suppressed: true }, fn);
    }
}
