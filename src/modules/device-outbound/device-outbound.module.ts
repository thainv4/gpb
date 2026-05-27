import { Module } from '@nestjs/common';
import { DeviceOutboundRepository } from './repositories/device-outbound.repository';
import { DeviceOutboundService } from './device-outbound.service';
import { DeviceOutboundController } from './device-outbound.controller';
import { ServiceRequestModule } from '../service-request/service-request.module';
import { AuthModule } from '../auth/auth.module';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { Hl7OutQueueModule } from '../hl7-out-queue/hl7-out-queue.module';

@Module({
    imports: [
        Hl7OutQueueModule,
        ServiceRequestModule,
        AuthModule,
    ],
    controllers: [DeviceOutboundController],
    providers: [
        CurrentUserContextService,
        DeviceOutboundService,
    ],
    exports: [DeviceOutboundService],
})
export class DeviceOutboundModule {}
