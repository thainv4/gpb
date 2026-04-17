import TransportStream = require('winston-transport');

export interface SeqHttpTransportOptions extends TransportStream.TransportStreamOptions {
    serverUrl: string;
    apiKey?: string;
    onError?: (err: Error) => void;
}

/**
 * Winston transport that POSTs CLEF events to Seq (`/ingest/clef`).
 * Replaces `@datalust/winston-seq`, which is ESM-only and breaks Nest (CJS) on Node 20+.
 */
export class SeqHttpTransport extends TransportStream {
    private readonly ingestUrl: string;
    private readonly apiKey?: string;
    private readonly onError?: (err: Error) => void;

    constructor(opts: SeqHttpTransportOptions) {
        super(opts);
        const base = opts.serverUrl.replace(/\/$/, '');
        this.ingestUrl = `${base}/ingest/clef`;
        this.apiKey = opts.apiKey;
        this.onError = opts.onError;
    }

    log(info: Record<string, unknown>, callback: () => void): void {
        setImmediate(() => this.emit('logged', info));

        const body = JSON.stringify(this.toClef(info)) + '\n';
        const headers: Record<string, string> = {
            'Content-Type': 'application/vnd.serilog.clef',
        };
        if (this.apiKey) {
            headers['X-Seq-ApiKey'] = this.apiKey;
        }

        void fetch(this.ingestUrl, { method: 'POST', headers, body })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Seq ingest HTTP ${res.status}`);
                }
            })
            .catch((err: unknown) => {
                const e = err instanceof Error ? err : new Error(String(err));
                if (this.onError) {
                    this.onError(e);
                } else {
                    console.error('[Seq transport]', e);
                }
            })
            .finally(() => callback());
    }

    private toClef(info: Record<string, unknown>): Record<string, unknown> {
        const { level, message, timestamp, ...rest } = info;
        const clef: Record<string, unknown> = {
            '@t': typeof timestamp === 'string' ? timestamp : new Date().toISOString(),
            '@l': level,
            '@m': typeof message === 'string' ? message : JSON.stringify(message),
        };
        for (const [key, value] of Object.entries(rest)) {
            if (key === 'splat') continue;
            clef[key] = value;
        }
        return clef;
    }
}

/**
 * Seq ingestion is enabled when `SEQ_SERVER_URL` is set (e.g. http://localhost:5341).
 * Optional `SEQ_API_KEY` when the Seq server requires an API key.
 */
export function tryCreateSeqTransport(): SeqHttpTransport | null {
    const serverUrl = process.env.SEQ_SERVER_URL?.trim();
    if (!serverUrl) {
        return null;
    }
    return new SeqHttpTransport({
        serverUrl,
        apiKey: process.env.SEQ_API_KEY || undefined,
        onError: (err) => console.error('[Seq transport]', err),
    });
}
