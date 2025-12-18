import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppError } from '../errors/app.error';
import { AppLoggerService } from '../../shared/services/logger.service';
import { RequestWithContext } from '../middleware/request-context.middleware';

export interface ErrorResponse {
    success: false;
    status_code: number;
    error: {
        code: string;
        message: string;
        details?: any;
        timestamp: string;
        trace_id?: string;
    };
    meta: {
        timestamp: string;
        request_id?: string;
        path?: string;
        method?: string;
    };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    constructor(private readonly logger: AppLoggerService) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<RequestWithContext>();

        const errorResponse = this.buildErrorResponse(exception, request);

        // Log the error
        this.logError(exception, request, errorResponse);

        response.status(errorResponse.status_code).json(errorResponse);
    }

    private buildErrorResponse(exception: unknown, request: RequestWithContext): ErrorResponse {
        const timestamp = new Date().toISOString();
        const traceId = request.traceContext?.traceId || this.generateTraceId();

        // Handle AppError (our custom errors)
        if (exception instanceof AppError) {
            return {
                success: false,
                status_code: exception.getStatus(),
                error: {
                    code: exception.code,
                    message: exception.message,
                    details: exception.details,
                    timestamp: exception.timestamp,
                    trace_id: traceId,
                },
                meta: {
                    timestamp,
                    request_id: request.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    path: request.url,
                    method: request.method,
                },
            };
        }

        // Handle HttpException (NestJS built-in)
        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            let message = 'Internal server error';
            let code = 'HTTP_001';
            let details: any = undefined;

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                const responseObj = exceptionResponse as any;
                message = responseObj.message || responseObj.error || message;
                code = responseObj.code || code;
                details = responseObj.details;
            }

            return {
                success: false,
                status_code: status,
                error: {
                    code,
                    message,
                    details,
                    timestamp,
                    trace_id: traceId,
                },
                meta: {
                    timestamp,
                    request_id: request.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    path: request.url,
                    method: request.method,
                },
            };
        }

        // Handle generic errors
        const error = exception as Error;
        return {
            success: false,
            status_code: HttpStatus.INTERNAL_SERVER_ERROR,
            error: {
                code: 'SYS_001',
                message: error.message || 'Internal server error',
                timestamp,
                trace_id: traceId,
            },
            meta: {
                timestamp,
                request_id: request.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                path: request.url,
                method: request.method,
            },
        };
    }

    private logError(exception: unknown, request: RequestWithContext, errorResponse: ErrorResponse): void {
        const { status_code, error } = errorResponse;
        const { method, url, ip, headers } = request;
        const userAgent = headers['user-agent'] || 'Unknown';

        const logContext = {
            traceId: error.trace_id,
            requestId: request.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            method,
            url,
            ip,
            userAgent,
            statusCode: status_code,
            errorCode: error.code,
            userId: request.user?.id,
        };

        // Log level based on status code
        if (status_code >= 500) {
            this.logger.error(
                `${method} ${url} - ${error.code}: ${error.message}`,
                exception instanceof Error ? exception.stack : undefined,
                logContext,
            );
        } else if (status_code >= 400) {
            this.logger.warn(
                `${method} ${url} - ${error.code}: ${error.message}`,
                logContext,
            );
        } else {
            this.logger.log(
                `${method} ${url} - ${error.code}: ${error.message}`,
                logContext,
            );
        }

        // Log additional details for debugging
        if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
            this.logger.debug('Error stack trace', {
                ...logContext,
                stack: exception.stack,
            });
        }
    }

    private generateTraceId(): string {
        return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

}
