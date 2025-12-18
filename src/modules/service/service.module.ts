import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { Service } from './entities/service.entity';
import { ServiceRepository } from './service.repository';
import { DataLoaderModule } from '../../shared/dataloaders/dataloader.module';
import { ServicesModule } from '../../common/services/services.module';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { UnitOfMeasure } from '../unit-of-measure/entities/unit-of-measure.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Service, UnitOfMeasure]),
        DataLoaderModule,
        ServicesModule,
        AuthModule, // Import để sử dụng DualAuthGuard
    ],
    controllers: [ServiceController],
    providers: [
        ServiceService,
        {
            provide: 'IServiceRepository',
            useClass: ServiceRepository,
        },
        ServiceRepository,
        CurrentUserContextService,
    ],
    exports: [ServiceService, 'IServiceRepository'],
})
export class ServiceModule { }
