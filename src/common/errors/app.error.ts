import { HttpException, HttpStatus } from '@nestjs/common';

export interface AppErrorDetails {
    field?: string;
    value?: any;
    constraint?: string;
    context?: Record<string, any>;
}

export class AppError extends HttpException {
    public readonly code: string;
    public readonly details?: AppErrorDetails;
    public readonly timestamp: string;
    public readonly traceId?: string;

    constructor(
        code: string,
        message: string,
        statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
        details?: AppErrorDetails,
        traceId?: string,
    ) {
        super(
            {
                code,
                message,
                details,
                timestamp: new Date().toISOString(),
                traceId,
            },
            statusCode,
        );

        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
        this.traceId = traceId;
    }

    // System Errors (1xxx)
    static internalServerError(message: string = 'Internal server error', traceId?: string): AppError {
        return new AppError('SYS_001', message, HttpStatus.INTERNAL_SERVER_ERROR, undefined, traceId);
    }

    static serviceUnavailable(message: string = 'Service temporarily unavailable', traceId?: string): AppError {
        return new AppError('SYS_002', message, HttpStatus.SERVICE_UNAVAILABLE, undefined, traceId);
    }

    static requestTimeout(message: string = 'Request timeout', traceId?: string): AppError {
        return new AppError('SYS_003', message, HttpStatus.REQUEST_TIMEOUT, undefined, traceId);
    }

    static databaseConnectionError(message: string = 'Database connection failed', traceId?: string): AppError {
        return new AppError('SYS_004', message, HttpStatus.SERVICE_UNAVAILABLE, undefined, traceId);
    }

    // Validation Errors (2xxx)
    static validationError(message: string, field?: string, value?: any): AppError {
        return new AppError(
            'VAL_001',
            message,
            HttpStatus.BAD_REQUEST,
            { field, value },
        );
    }

    static invalidFormat(message: string, field: string, value: any): AppError {
        return new AppError(
            'VAL_002',
            message,
            HttpStatus.UNPROCESSABLE_ENTITY,
            { field, value, constraint: 'format' },
        );
    }

    static valueOutOfRange(message: string, field: string, value: any, min?: number, max?: number): AppError {
        return new AppError(
            'VAL_003',
            message,
            HttpStatus.UNPROCESSABLE_ENTITY,
            { field, value, constraint: 'range', context: { min, max } },
        );
    }

    static requiredField(field: string): AppError {
        return new AppError(
            'VAL_004',
            `${field} is required`,
            HttpStatus.BAD_REQUEST,
            { field, constraint: 'required' },
        );
    }

    static passwordStrengthError(errors: string[]): AppError {
        return new AppError(
            'VAL_005',
            'Password does not meet strength requirements',
            HttpStatus.BAD_REQUEST,
            { field: 'password', constraint: 'strength', context: { errors } },
        );
    }

    // Authentication/Authorization Errors (3xxx)
    static unauthorized(message: string = 'Unauthorized'): AppError {
        return new AppError('AUTH_001', message, HttpStatus.UNAUTHORIZED);
    }

    static invalidToken(message: string = 'Invalid or expired token'): AppError {
        return new AppError('AUTH_002', message, HttpStatus.UNAUTHORIZED);
    }

    static tokenExpired(message: string = 'Token has expired'): AppError {
        return new AppError('AUTH_003', message, HttpStatus.UNAUTHORIZED);
    }

    static insufficientPermissions(message: string = 'Insufficient permissions'): AppError {
        return new AppError('AUTH_004', message, HttpStatus.FORBIDDEN);
    }

    static accountLocked(message: string = 'Account is locked'): AppError {
        return new AppError('AUTH_005', message, HttpStatus.FORBIDDEN);
    }

    static accountInactive(message: string = 'Account is inactive'): AppError {
        return new AppError('AUTH_006', message, HttpStatus.FORBIDDEN);
    }

    // Business Logic Errors (4xxx)
    static notFound(resource: string, id?: string): AppError {
        const message = id ? `${resource} with ID '${id}' not found` : `${resource} not found`;
        return new AppError('BIZ_001', message, HttpStatus.NOT_FOUND, { field: 'id', value: id });
    }

    static conflict(message: string, field?: string, value?: any): AppError {
        return new AppError('BIZ_002', message, HttpStatus.CONFLICT, { field, value });
    }

    static businessRuleViolation(message: string, rule?: string): AppError {
        return new AppError('BIZ_003', message, HttpStatus.UNPROCESSABLE_ENTITY, { constraint: rule });
    }

    static resourceLimitExceeded(message: string, limit?: number): AppError {
        return new AppError('BIZ_004', message, HttpStatus.UNPROCESSABLE_ENTITY, { context: { limit } });
    }

    static duplicateEntry(field: string, value: any): AppError {
        return new AppError(
            'BIZ_005',
            `${field} '${value}' already exists`,
            HttpStatus.CONFLICT,
            { field, value },
        );
    }

    // External Dependencies Errors (5xxx)
    static externalServiceError(service: string, message: string): AppError {
        return new AppError('EXT_001', `${service} service error: ${message}`, HttpStatus.BAD_GATEWAY, {
            context: { service },
        });
    }

    static externalServiceTimeout(service: string): AppError {
        return new AppError('EXT_002', `${service} service timeout`, HttpStatus.GATEWAY_TIMEOUT, {
            context: { service },
        });
    }

    static externalServiceUnavailable(service: string): AppError {
        return new AppError('EXT_003', `${service} service unavailable`, HttpStatus.SERVICE_UNAVAILABLE, {
            context: { service },
        });
    }

    // Rate Limiting Errors (6xxx)
    static rateLimitExceeded(limit: number, window: string): AppError {
        return new AppError(
            'RATE_001',
            `Rate limit exceeded: ${limit} requests per ${window}`,
            HttpStatus.TOO_MANY_REQUESTS,
            { context: { limit, window } },
        );
    }

    // Cache Errors (7xxx)
    static cacheError(operation: string, message: string): AppError {
        return new AppError('CACHE_001', `Cache ${operation} failed: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR, {
            context: { operation },
        });
    }

    // Database Errors (8xxx)
    static databaseError(operation: string, message: string): AppError {
        return new AppError('DB_001', `Database ${operation} failed: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR, {
            context: { operation },
        });
    }

    static constraintViolation(constraint: string, message: string): AppError {
        return new AppError('DB_002', `Database constraint violation: ${message}`, HttpStatus.CONFLICT, {
            constraint,
        });
    }

    static transactionFailed(message: string): AppError {
        return new AppError('DB_003', `Transaction failed: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // File/Upload Errors (9xxx)
    static fileNotFound(filename: string): AppError {
        return new AppError('FILE_001', `File '${filename}' not found`, HttpStatus.NOT_FOUND, {
            field: 'filename',
            value: filename,
        });
    }

    static fileSizeExceeded(maxSize: number): AppError {
        return new AppError('FILE_002', `File size exceeds maximum allowed size of ${maxSize} bytes`, HttpStatus.PAYLOAD_TOO_LARGE, {
            context: { maxSize },
        });
    }

    static invalidFileType(allowedTypes: string[]): AppError {
        return new AppError('FILE_003', `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`, HttpStatus.UNSUPPORTED_MEDIA_TYPE, {
            context: { allowedTypes },
        });
    }

    // Utility methods
    static fromHttpException(exception: HttpException, code?: string): AppError {
        const statusCode = exception.getStatus();
        const response = exception.getResponse();
        const message = typeof response === 'string' ? response : (response as any).message || 'Unknown error';
        
        return new AppError(
            code || 'UNKNOWN_001',
            message,
            statusCode,
        );
    }

    static fromError(error: Error, code: string = 'UNKNOWN_002'): AppError {
        return new AppError(code, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Get HTTP status code from error code
    static getStatusFromErrorCode(errorCode: string): HttpStatus {
        const codePrefix = errorCode.split('_')[0];
        
        switch (codePrefix) {
            case 'SYS':
                return HttpStatus.INTERNAL_SERVER_ERROR;
            case 'VAL':
                return HttpStatus.BAD_REQUEST;
            case 'AUTH':
                return HttpStatus.UNAUTHORIZED;
            case 'BIZ':
                return HttpStatus.UNPROCESSABLE_ENTITY;
            case 'EXT':
                return HttpStatus.BAD_GATEWAY;
            case 'RATE':
                return HttpStatus.TOO_MANY_REQUESTS;
            case 'CACHE':
            case 'DB':
                return HttpStatus.INTERNAL_SERVER_ERROR;
            case 'FILE':
                return HttpStatus.BAD_REQUEST;
            default:
                return HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
}
