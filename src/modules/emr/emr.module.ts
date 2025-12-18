import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EmrController } from './emr.controller';
import { EmrService } from './emr.service';
import { AuthModule } from '../auth/auth.module';
import { ProfileModule } from '../profile/profile.module';

@Module({
    imports: [
        HttpModule.register({
            timeout: 60000,
            maxRedirects: 5,
        }),
        AuthModule, // Import để sử dụng DualAuthGuard
        ProfileModule, // Import để sử dụng ProfileService
    ],
    controllers: [EmrController],
    providers: [EmrService],
    exports: [EmrService],
})
export class EmrModule {}

