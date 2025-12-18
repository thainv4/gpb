import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

export interface CurrentUser {
    id: string;
    username: string;
    email: string;
}

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): CurrentUser | null => {
        const request = ctx.switchToHttp().getRequest<Request & { authType?: string; hisTokenCode?: string }>();
        const user = request.user || request.currentUser;

        // Nếu có user từ JWT, trả về user
        if (user) {
            return {
                id: (user as any).id,
                username: (user as any).username,
                email: (user as any).email,
            };
        }

        // Nếu dùng HIS token và không có user, trả về null
        // Các service cần xử lý trường hợp này (có thể dùng system user hoặc skip audit)
        if (request.authType === 'HIS') {
            return null;
        }

        // Nếu không có user và không phải HIS token, throw error
        throw new UnauthorizedException('User not found in request. JWT authentication required for this operation.');
    },
);
