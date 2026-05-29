import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SampleRejection } from './entities/sample-rejection.entity';
import { SampleRejectionController } from './sample-rejection.controller';
import { SampleRejectionService } from './sample-rejection.service';
import { SampleRejectionRepository } from './repositories/sample-rejection.repository';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([SampleRejection]),
        AuthModule,
    ],
    controllers: [SampleRejectionController],
    providers: [
        SampleRejectionService,
        CurrentUserContextService,
        {
            provide: 'ISampleRejectionRepository',
            useClass: SampleRejectionRepository,
        },
    ],
    exports: [SampleRejectionService],
})
export class SampleRejectionModule { }
