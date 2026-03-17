import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceOutbound } from './entities/device-outbound.entity';
import { DeviceOutboundRepository } from './repositories/device-outbound.repository';
import { DeviceOutboundService } from './device-outbound.service';
import { DeviceOutboundController } from './device-outbound.controller';
import { ServiceRequestModule } from '../service-request/service-request.module';
import { AuthModule } from '../auth/auth.module';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([DeviceOutbound]),
        ServiceRequestModule, // Để inject IStoredServiceRequestServiceRepository (getServicesByReceptionCode)
        AuthModule, // Để sử dụng DualAuthGuard (JwtAuthGuard)
    ],
    controllers: [DeviceOutboundController],
    providers: [
        CurrentUserContextService,
        DeviceOutboundService,
        {
            provide: 'IDeviceOutboundRepository',
            useClass: DeviceOutboundRepository,
        },
    ],
    exports: [DeviceOutboundService],
})
export class DeviceOutboundModule {}
