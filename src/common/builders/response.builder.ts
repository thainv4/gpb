import { PaginationMeta } from '../dto/pagination-response.dto';

export interface BaseResponse<T = any> {
    success: boolean;
    status_code: number;
    data?: T;
    meta?: Meta;
    error?: AppError;
}

export interface Meta {
    pagination?: Pagination;
    timestamp: string;
    request_id?: string;
    trace_id?: string;
    joinInfo?: {
        totalJoins: number;
        joinTables: string[];
        executionTime: number;
    };
}

export interface Pagination {
    limit: number;
    offset: number;
    total: number;
    has_next: boolean;
    has_prev: boolean;
}

export interface AppError {
    code: string;
    message: string;
    timestamp: string;
    trace_id: string;
    details?: any;
}

export class ResponseBuilder {
    static success<T>(data: T, statusCode: number = 200, requestId?: string, traceId?: string): BaseResponse<T> {
        return {
            success: true,
            status_code: statusCode,
            data,
            meta: {
                timestamp: new Date().toISOString(),
                ...(requestId && { request_id: requestId }),
                ...(traceId && { trace_id: traceId }),
            },
        };
    }

    static error(error: AppError, statusCode: number, requestId?: string, traceId?: string): BaseResponse {
        return {
            success: false,
            status_code: statusCode,
            error: {
                ...error,
                timestamp: new Date().toISOString(),
                trace_id: traceId || 'unknown',
            },
            meta: {
                timestamp: new Date().toISOString(),
                ...(requestId && { request_id: requestId }),
                ...(traceId && { trace_id: traceId }),
            },
        };
    }

    static successWithPagination<T>(
        data: T[],
        total: number,
        limit: number,
        offset: number,
        requestId?: string,
        traceId?: string
    ): BaseResponse<{ items: T[]; pagination: PaginationMeta }> {
        return {
            success: true,
            status_code: 200,
            data: {
                items: data,
                pagination: {
                    total,
                    limit,
                    offset,
                    hasNext: offset + limit < total,
                    hasPrev: offset > 0,
                },
            },
            meta: {
                timestamp: new Date().toISOString(),
                ...(requestId && { request_id: requestId }),
                ...(traceId && { trace_id: traceId }),
            },
        };
    }

    // Enhanced methods with request context
    static successWithContext<T>(
        data: T,
        statusCode: number = 200,
        context: { requestId?: string; traceId?: string }
    ): BaseResponse<T> {
        return this.success(data, statusCode, context.requestId, context.traceId);
    }

    static errorWithContext(
        error: Omit<AppError, 'timestamp' | 'trace_id'>,
        statusCode: number,
        context: { requestId?: string; traceId?: string }
    ): BaseResponse {
        const fullError: AppError = {
            ...error,
            timestamp: new Date().toISOString(),
            trace_id: context.traceId || 'unknown',
        };
        return this.error(fullError, statusCode, context.requestId, context.traceId);
    }
}

// Join Response Builder cho multi-table joins
export class JoinResponseBuilder {
    static successWithJoin<T>(
        data: T,
        joinInfo: {
            totalJoins: number;
            joinTables: string[];
            executionTime: number;
        },
        statusCode: number = 200,
        requestId?: string,
        traceId?: string
    ): BaseResponse<T> {
        return {
            success: true,
            status_code: statusCode,
            data,
            meta: {
                timestamp: new Date().toISOString(),
                ...(requestId && { request_id: requestId }),
                ...(traceId && { trace_id: traceId }),
                joinInfo,
            },
        };
    }

    static successWithPagination<T>(
        data: T[],
        pagination: {
            total: number;
            limit: number;
            offset: number;
            hasNext: boolean;
            hasPrev: boolean;
        },
        joinInfo?: {
            totalJoins: number;
            joinTables: string[];
            executionTime: number;
        },
        requestId?: string,
        traceId?: string
    ): BaseResponse<{ items: T[]; pagination: typeof pagination }> {
        return {
            success: true,
            status_code: 200,
            data: {
                items: data,
                pagination,
            },
            meta: {
                timestamp: new Date().toISOString(),
                ...(requestId && { request_id: requestId }),
                ...(traceId && { trace_id: traceId }),
                ...(joinInfo && { joinInfo }),
            },
        };
    }
}
