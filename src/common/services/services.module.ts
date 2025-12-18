import { Module } from '@nestjs/common';
import { CurrentUserContextService } from './current-user-context.service';

@Module({
    providers: [CurrentUserContextService],
    exports: [CurrentUserContextService],
})
export class ServicesModule { }
