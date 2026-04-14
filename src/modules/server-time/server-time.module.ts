import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ServerTimeController } from './server-time.controller';
import { ServerTimeService } from './server-time.service';

@Module({
    imports: [AuthModule],
    controllers: [ServerTimeController],
    providers: [ServerTimeService],
})
export class ServerTimeModule {}
