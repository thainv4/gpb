import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AppLoggerService } from '../../shared/services/logger.service';
import { RequestWithContext } from '../middleware/request-context.middleware';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(
        private readonly logger: AppLoggerService,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<RequestWithContext>();
        const response = context.switchToHttp().getResponse();
        const startTime = Date.now();

        const className = context.getClass().name;
        const methodName = context.getHandler().name;
        const operation = `${className}.${methodName}`;

        // Log method entry
        this.logger.debug(`Method entry: ${operation}`, {
            traceId: request.traceContext?.traceId,
            requestId: request.requestId,
            method: request.method,
            url: request.url,
            operation,
            userId: request.user?.id,
        });

        return next.handle().pipe(
            tap((data) => {
                const duration = Date.now() - startTime;

                // Log successful execution
                this.logger.debug(`Method success: ${operation}`, {
                    traceId: request.traceContext?.traceId,
                    requestId: request.requestId,
                    operation,
                    duration,
                    userId: request.user?.id,
                    responseSize: JSON.stringify(data).length,
                });

                // Log performance if slow
                if (duration > 1000) { // > 1 second
                    this.logger.logPerformance(operation, duration, {
                        traceId: request.traceContext?.traceId,
                        requestId: request.requestId,
                        operation,
                        userId: request.user?.id,
                    });
                }
            }),
            catchError((error) => {
                const duration = Date.now() - startTime;

                // Log error
                this.logger.error(`Method error: ${operation}`, error.stack, {
                    traceId: request.traceContext?.traceId,
                    requestId: request.requestId,
                    operation,
                    duration,
                    userId: request.user?.id,
                    errorName: error.name,
                    errorMessage: error.message,
                    errorCode: error.code,
                });

                throw error;
            }),
        );
    }
}
