import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface CurrentUser {
    id: string;
    username: string;
    email: string;
}

declare global {
    namespace Express {
        interface Request {
            currentUser?: CurrentUser;
        }
    }
}

@Injectable()
export class UserContextMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // Extract user info from JWT token (đã được validate bởi JwtAuthGuard)
        const user = req.user as any; // User từ JWT Strategy
        if (user) {
            req.currentUser = {
                id: user.id,
                username: user.username,
                email: user.email,
            };
        }
        next();
    }
}
