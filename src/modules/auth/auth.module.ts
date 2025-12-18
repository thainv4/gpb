import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from '../user/user.module';
import { ProfileModule } from '../profile/profile.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ServicesModule } from '../../shared/services/services.module';
import { HisIntegrationService } from '../../shared/services/his-integration.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { DualAuthGuard } from './guards/dual-auth.guard';
import { HisAuthGuard } from './guards/his-auth.guard';

@Module({
    imports: [
        forwardRef(() => UserModule), // Sử dụng forwardRef để tránh circular dependency
        forwardRef(() => ProfileModule), // Sử dụng forwardRef để tránh circular dependency
        ServicesModule,
        PassportModule,
        HttpModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your-super-secret-key-here',
            signOptions: {
                expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
                issuer: 'lis-gpb-backend',
                audience: 'lis-gpb-users',
            },
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        HisIntegrationService,
        JwtAuthGuard,
        DualAuthGuard,
        HisAuthGuard,
    ],
    exports: [
        AuthService,
        JwtStrategy,
        HisIntegrationService,
        JwtAuthGuard,
        DualAuthGuard,
        HisAuthGuard,
    ],
})
export class AuthModule { }
