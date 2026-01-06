import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

/**
 * Public Guard - Luôn cho phép truy cập (không cần authentication)
 * Sử dụng để override guard ở class level cho các endpoint public
 */
@Injectable()
export class PublicGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        request.authType = 'PUBLIC';
        return true;
    }
}

