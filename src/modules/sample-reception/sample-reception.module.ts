import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SampleReception } from './entities/sample-reception.entity';
import { SampleReceptionRepository } from './sample-reception.repository';
import { SampleReceptionService } from './sample-reception.service';
import { SampleReceptionController } from './sample-reception.controller';
import { ServicesModule } from '../../shared/services/services.module';
import { DataLoaderModule } from '../../shared/dataloaders/dataloader.module';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { SampleTypeModule } from '../sample-type/sample-type.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([SampleReception]),
        ServicesModule,
        DataLoaderModule,
        SampleTypeModule, // Import SampleTypeModule để sử dụng ISampleTypeRepository
        AuthModule, // Import để sử dụng DualAuthGuard
    ],
    controllers: [SampleReceptionController],
    providers: [
        SampleReceptionService,
        CurrentUserContextService,
        {
            provide: 'ISampleReceptionRepository',
            useClass: SampleReceptionRepository,
        },
    ],
    exports: [
        SampleReceptionService,
        'ISampleReceptionRepository',
    ],
})
export class SampleReceptionModule { }
