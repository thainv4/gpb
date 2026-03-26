import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PivkaResult } from './entities/pivka-result.entity';
import { PivkaResultRepository } from './repositories/pivka-result.repository';
import { PivkaResultService } from './pivka-result.service';
import { PivkaResultController } from './pivka-result.controller';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { AuthModule } from '../auth/auth.module';
import { StoredServiceRequestService } from '../service-request/entities/stored-service-request-service.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([PivkaResult, StoredServiceRequestService]),
        AuthModule,
    ],
    controllers: [PivkaResultController],
    providers: [
        PivkaResultService,
        CurrentUserContextService,
        {
            provide: 'IPivkaResultRepository',
            useClass: PivkaResultRepository,
        },
    ],
    exports: [
        PivkaResultService,
        'IPivkaResultRepository',
    ],
})
export class PivkaResultModule { }

