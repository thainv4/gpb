import { SeqTransport } from '@datalust/winston-seq';

/**
 * Seq ingestion is enabled when `SEQ_SERVER_URL` is set (e.g. http://localhost:5341).
 * Optional `SEQ_API_KEY` when the Seq server requires an API key.
 */
export function tryCreateSeqTransport(): SeqTransport | null {
    const serverUrl = process.env.SEQ_SERVER_URL?.trim();
    if (!serverUrl) {
        return null;
    }
    return new SeqTransport({
        serverUrl,
        apiKey: process.env.SEQ_API_KEY || undefined,
        onError: (err) => console.error('[Seq transport]', err),
    });
}
