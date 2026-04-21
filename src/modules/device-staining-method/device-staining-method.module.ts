import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceStainingMethod } from './entities/device-staining-method.entity';
import { DeviceStainingMethodController } from './device-staining-method.controller';
import { DeviceStainingMethodService } from './device-staining-method.service';
import { DeviceStainingMethodRepository } from './repositories/device-staining-method.repository';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([DeviceStainingMethod]),
        AuthModule,
    ],
    controllers: [DeviceStainingMethodController],
    providers: [
        DeviceStainingMethodService,
        CurrentUserContextService,
        {
            provide: 'IDeviceStainingMethodRepository',
            useClass: DeviceStainingMethodRepository,
        },
    ],
    exports: [
        DeviceStainingMethodService,
        'IDeviceStainingMethodRepository',
    ],
})
export class DeviceStainingMethodModule { }
