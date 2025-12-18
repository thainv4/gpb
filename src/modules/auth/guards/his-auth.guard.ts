import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

/**
 * HIS Auth Guard - Chỉ chấp nhận HIS token
 * 
 * Kiểm tra TokenCode và ApplicationCode headers từ HIS system
 */
@Injectable()
export class HisAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        
        const hisTokenCode = request.headers['tokencode'] || request.headers['TokenCode'];
        const applicationCode = request.headers['applicationcode'] || request.headers['ApplicationCode'];

        if (!hisTokenCode) {
            throw new UnauthorizedException('HIS TokenCode header is required');
        }

        if (!applicationCode) {
            throw new UnauthorizedException('HIS ApplicationCode header is required');
        }

        // Lưu thông tin vào request để service có thể sử dụng
        request.hisTokenCode = hisTokenCode;
        request.applicationCode = applicationCode;
        request.authType = 'HIS';

        return true;
    }
}

