import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Province } from './entities/province.entity';
import { ProvinceRepository } from './province.repository';
import { ProvinceService } from './province.service';
import { ProvinceController } from './province.controller';
import { ServicesModule } from '../../shared/services/services.module';
import { DataLoaderModule } from '../../shared/dataloaders/dataloader.module';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Province]),
        ServicesModule,
        DataLoaderModule,
        AuthModule, // Import để sử dụng DualAuthGuard
    ],
    controllers: [ProvinceController],
    providers: [
        ProvinceService,
        CurrentUserContextService,
        {
            provide: 'IProvinceRepository',
            useClass: ProvinceRepository,
        },
    ],
    exports: [
        ProvinceService,
        'IProvinceRepository',
    ],
})
export class ProvinceModule { }
