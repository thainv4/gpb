import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Đọc cơ sở (HIS_BRANCH.ID) mà client đang đăng nhập từ header `X-His-Branch-Id`.
 * FE gắn header này tập trung cho mọi request (xem fe-gpb client.ts).
 * Trả về number nếu hợp lệ, ngược lại undefined.
 */
export const HisBranchId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): number | undefined => {
        const request = ctx.switchToHttp().getRequest<Request>();
        const raw = request.headers['x-his-branch-id'];
        const value = Array.isArray(raw) ? raw[0] : raw;
        if (value === undefined || value === null || value === '') {
            return undefined;
        }
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    },
);
