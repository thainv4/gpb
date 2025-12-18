import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

export interface TraceContext {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    baggage?: Record<string, string>;
}

@Injectable()
export class TraceService {
    private readonly traceIdLength = 32;
    private readonly spanIdLength = 16;

    /**
     * Generate a new trace ID
     */
    generateTraceId(): string {
        return randomBytes(this.traceIdLength).toString('hex');
    }

    /**
     * Generate a new span ID
     */
    generateSpanId(): string {
        return randomBytes(this.spanIdLength).toString('hex');
    }

    /**
     * Create a new trace context
     */
    createTraceContext(parentContext?: TraceContext): TraceContext {
        return {
            traceId: parentContext?.traceId || this.generateTraceId(),
            spanId: this.generateSpanId(),
            parentSpanId: parentContext?.spanId,
            baggage: parentContext?.baggage || {},
        };
    }

    /**
     * Extract trace context from headers
     */
    extractFromHeaders(headers: Record<string, string | string[] | undefined>): TraceContext | null {
        try {
            const traceparent = headers['traceparent'] as string;
            if (!traceparent) {
                return null;
            }

            // Parse W3C Trace Context format: 00-{traceId}-{spanId}-{flags}
            const parts = traceparent.split('-');
            if (parts.length !== 4 || parts[0] !== '00') {
                return null;
            }

            const [, traceId, spanId] = parts;

            return {
                traceId,
                spanId,
                baggage: this.extractBaggage(headers),
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Inject trace context into headers
     */
    injectToHeaders(context: TraceContext): Record<string, string> {
        const headers: Record<string, string> = {};

        // W3C Trace Context format
        headers['traceparent'] = `00-${context.traceId}-${context.spanId}-01`;

        // Add baggage items
        if (context.baggage && Object.keys(context.baggage).length > 0) {
            headers['tracestate'] = Object.entries(context.baggage)
                .map(([key, value]) => `${key}=${value}`)
                .join(',');
        }

        return headers;
    }

    /**
     * Extract baggage from headers
     */
    private extractBaggage(headers: Record<string, string | string[] | undefined>): Record<string, string> {
        const tracestate = headers['tracestate'] as string;
        if (!tracestate) {
            return {};
        }

        const baggage: Record<string, string> = {};
        const items = tracestate.split(',');

        for (const item of items) {
            const [key, value] = item.split('=');
            if (key && value) {
                baggage[key.trim()] = value.trim();
            }
        }

        return baggage;
    }

    /**
     * Create child span from parent context
     */
    createChildSpan(parentContext: TraceContext): TraceContext {
        return {
            traceId: parentContext.traceId,
            spanId: this.generateSpanId(),
            parentSpanId: parentContext.spanId,
            baggage: { ...parentContext.baggage },
        };
    }

    /**
     * Add baggage to context
     */
    addBaggage(context: TraceContext, key: string, value: string): TraceContext {
        return {
            ...context,
            baggage: {
                ...context.baggage,
                [key]: value,
            },
        };
    }

    /**
     * Get baggage value from context
     */
    getBaggage(context: TraceContext, key: string): string | undefined {
        return context.baggage?.[key];
    }

    /**
     * Check if context is valid
     */
    isValidContext(context: TraceContext): boolean {
        return !!(context.traceId && context.spanId);
    }

    /**
     * Format trace context for logging
     */
    formatForLogging(context: TraceContext): string {
        return `traceId=${context.traceId}, spanId=${context.spanId}`;
    }

    /**
     * Create trace context from request
     */
    createFromRequest(request: any): TraceContext {
        const headers = request.headers || {};
        const existingContext = this.extractFromHeaders(headers);

        if (existingContext) {
            return existingContext;
        }

        return this.createTraceContext();
    }

    /**
     * Start a new trace (root span)
     */
    startTrace(): TraceContext {
        return this.createTraceContext();
    }

    /**
     * Continue trace from existing context
     */
    continueTrace(traceId: string, parentSpanId?: string): TraceContext {
        return {
            traceId,
            spanId: this.generateSpanId(),
            parentSpanId,
            baggage: {},
        };
    }
}
