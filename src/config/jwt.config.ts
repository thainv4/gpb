import { JwtModuleAsyncOptions } from '@nestjs/jwt';

export const jwtConfig: JwtModuleAsyncOptions = {
    useFactory: () => ({
        secret: process.env.JWT_SECRET || 'your-super-secret-key-here',
        signOptions: {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
            issuer: 'lis-gpb-backend',
            audience: 'lis-gpb-users',
        },
    }),
};
