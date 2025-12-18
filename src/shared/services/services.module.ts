import { Module } from '@nestjs/common';
import { PasswordService } from './password.service';
import { AppLoggerService } from './logger.service';
import { TraceService } from './trace.service';
import { CurrentUserContextService } from './current-user-context.service';

@Module({
    providers: [PasswordService, AppLoggerService, TraceService, CurrentUserContextService],
    exports: [PasswordService, AppLoggerService, TraceService, CurrentUserContextService],
})
export class ServicesModule { }
