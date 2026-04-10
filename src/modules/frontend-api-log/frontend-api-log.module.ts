import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FrontendApiLogController } from './frontend-api-log.controller';
import { FrontendApiLogService } from './frontend-api-log.service';

@Module({
    imports: [AuthModule],
    controllers: [FrontendApiLogController],
    providers: [FrontendApiLogService],
})
export class FrontendApiLogModule { }
