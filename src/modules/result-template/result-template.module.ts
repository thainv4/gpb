import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResultTemplateController } from './result-template.controller';
import { ResultTemplateService } from './result-template.service';
import { ResultTemplateRepository } from './repositories/result-template.repository';
import { ResultTemplate } from './entities/result-template.entity';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ResultTemplate]),
        AuthModule, // Import để sử dụng DualAuthGuard
    ],
    controllers: [ResultTemplateController],
    providers: [
        ResultTemplateService,
        CurrentUserContextService,
        {
            provide: 'IResultTemplateRepository',
            useClass: ResultTemplateRepository,
        },
    ],
    exports: [ResultTemplateService],
})
export class ResultTemplateModule { }

