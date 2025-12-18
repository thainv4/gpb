import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<Request>();
        const currentUser = request.currentUser;

        // Store current user in a way that can be accessed by entities
        if (currentUser) {
            // Store in request context for entity hooks to access
            (request as any).__currentUser = currentUser;
        }

        return next.handle().pipe(
            tap(() => {
                // Clean up after request
                delete (request as any).__currentUser;
            })
        );
    }
}
