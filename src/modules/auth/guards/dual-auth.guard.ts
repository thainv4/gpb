import { Injectable, ExecutionContext, UnauthorizedException, CanActivate } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * Dual Auth Guard - Chấp nhận cả JWT token (Backend) và HIS token
 * 
 * Logic:
 * 1. Ưu tiên kiểm tra JWT token (nếu có trong Authorization header)
 * 2. Nếu JWT không có hoặc không hợp lệ, kiểm tra HIS TokenCode header
 * 3. Nếu có một trong hai token hợp lệ thì cho phép truy cập
 */
@Injectable()
export class DualAuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtGuard: JwtAuthGuard,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        
        // Kiểm tra JWT token trước (ưu tiên)
        const authHeader = request.headers.authorization;
        const hasJwtToken = authHeader && authHeader.startsWith('Bearer ');

        if (hasJwtToken) {
            try {
                // Thử validate JWT token
                const jwtResult = await this.jwtGuard.canActivate(context);
                if (jwtResult) {
                    // JWT token hợp lệ, cho phép truy cập
                    request.authType = 'JWT';
                    return true;
                }
            } catch (error) {
                // JWT token không hợp lệ, tiếp tục kiểm tra HIS token
                // Không throw error ở đây, sẽ kiểm tra HIS token
            }
        }

        // Nếu không có JWT hoặc JWT không hợp lệ, kiểm tra HIS token
        const hisTokenCode = request.headers['tokencode'] || request.headers['TokenCode'];
        const applicationCode = request.headers['applicationcode'] || request.headers['ApplicationCode'];

        if (hisTokenCode && applicationCode) {
            // Có HIS token và ApplicationCode, cho phép truy cập
            // Lưu thông tin vào request để service có thể sử dụng
            request.hisTokenCode = hisTokenCode;
            request.applicationCode = applicationCode;
            request.authType = 'HIS';
            return true;
        }

        // Không có token nào hợp lệ
        throw new UnauthorizedException(
            'Authentication required. Please provide either JWT Bearer token (Authorization header) or HIS TokenCode and ApplicationCode headers.'
        );
    }
}

