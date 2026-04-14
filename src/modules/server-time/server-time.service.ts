import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class ServerTimeService {
    constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

    /** Oracle SYSTIMESTAMP as ISO 8601 (UTC). */
    async getDatabaseServerTimeIso(): Promise<string> {
        try {
            const rows = (await this.dataSource.query(
                `SELECT SYSTIMESTAMP AS "serverTime" FROM DUAL`,
            )) as Array<Record<string, unknown>>;

            const row = rows?.[0];
            if (!row) {
                throw new ServiceUnavailableException('Empty result from database time query');
            }

            const raw =
                row.serverTime ??
                row.SERVERTIME ??
                row.SERVER_TIME ??
                Object.values(row)[0];

            const d = this.coerceToDate(raw);
            if (!d || Number.isNaN(d.getTime())) {
                throw new ServiceUnavailableException('Invalid database timestamp value');
            }

            return d.toISOString();
        } catch (err) {
            if (err instanceof ServiceUnavailableException) {
                throw err;
            }
            const msg = err instanceof Error ? err.message : String(err);
            throw new ServiceUnavailableException(`Database server time failed: ${msg}`);
        }
    }

    private coerceToDate(raw: unknown): Date | null {
        if (raw == null) {
            return null;
        }
        if (raw instanceof Date) {
            return raw;
        }
        if (typeof raw === 'number') {
            return new Date(raw);
        }
        if (typeof raw === 'string') {
            const parsed = new Date(raw);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }
        if (typeof raw === 'object' && raw !== null && 'getTime' in raw && typeof (raw as Date).getTime === 'function') {
            const d = raw as Date;
            return Number.isNaN(d.getTime()) ? null : d;
        }
        return null;
    }
}
