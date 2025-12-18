import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';

export interface RequestWithContext extends Request {
    requestId: string;
    traceContext: {
        traceId: string;
        spanId: string;
    };
    startTime: number;
    user?: any;
}

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
    use(req: RequestWithContext, res: Response, next: NextFunction): void {
        // Generate request ID
        req.requestId = this.generateRequestId();

        // Create trace context
        req.traceContext = this.createTraceContext(req);

        // Record start time
        req.startTime = Date.now();

        // Add trace headers to response
        res.setHeader('traceparent', `00-${req.traceContext.traceId}-${req.traceContext.spanId}-01`);
        res.setHeader('X-Request-ID', req.requestId);

        // Override res.end to log response
        const originalEnd = res.end;
        res.end = (chunk?: any, encoding?: any, cb?: any) => {
            const duration = Date.now() - req.startTime;

            // Simple console log for now
            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'log',
                message: `Response: ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`,
                context: {
                    traceId: req.traceContext.traceId,
                    requestId: req.requestId,
                    method: req.method,
                    url: req.url,
                    statusCode: res.statusCode,
                    duration,
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    userId: req.user?.id,
                },
                service: 'lis-gpb-backend',
                version: '1.0.0',
                environment: process.env.NODE_ENV || 'development',
            }));

            // Call original end method
            return originalEnd.call(res, chunk, encoding, cb);
        };

        next();
    }

    private generateRequestId(): string {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 9);
        return `req_${timestamp}_${random}`;
    }

    private createTraceContext(req: Request): { traceId: string; spanId: string } {
        // Extract from headers if available
        const traceparent = req.headers['traceparent'] as string;
        if (traceparent) {
            const parts = traceparent.split('-');
            if (parts.length === 4 && parts[0] === '00') {
                return {
                    traceId: parts[1],
                    spanId: parts[2],
                };
            }
        }

        // Generate new trace context
        return {
            traceId: randomBytes(16).toString('hex'),
            spanId: randomBytes(8).toString('hex'),
        };
    }
}