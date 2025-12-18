import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { DepartmentRepository } from './department.repository';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { ServicesModule } from '../../shared/services/services.module';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { DataLoaderModule } from '../../shared/dataloaders/dataloader.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Department]),
        ServicesModule,
        DataLoaderModule,
        AuthModule, // Import để sử dụng DualAuthGuard
    ],
    controllers: [DepartmentController],
    providers: [
        DepartmentService,
        CurrentUserContextService,
        {
            provide: 'IDepartmentRepository',
            useClass: DepartmentRepository,
        },
    ],
    exports: [
        DepartmentService,
        'IDepartmentRepository',
    ],
})
export class DepartmentModule { }
