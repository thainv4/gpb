import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentType } from './entities/department-type.entity';
import { DepartmentTypeRepository } from './department-type.repository';
import { DepartmentTypeService } from './department-type.service';
import { DepartmentTypeController } from './department-type.controller';
import { ServicesModule } from '../../shared/services/services.module';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { DataLoaderModule } from '../../shared/dataloaders/dataloader.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([DepartmentType]),
        ServicesModule,
        DataLoaderModule,
        AuthModule, // Import để sử dụng DualAuthGuard
    ],
    controllers: [DepartmentTypeController],
    providers: [
        DepartmentTypeService,
        CurrentUserContextService,
        {
            provide: 'IDepartmentTypeRepository',
            useClass: DepartmentTypeRepository,
        },
    ],
    exports: [
        DepartmentTypeService,
        'IDepartmentTypeRepository',
    ],
})
export class DepartmentTypeModule { }
