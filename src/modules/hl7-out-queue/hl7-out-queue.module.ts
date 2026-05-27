import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hl7OutQueue } from './entities/hl7-out-queue.entity';
import { Hl7OutQueueRepository } from './repositories/hl7-out-queue.repository';
import { Hl7OutQueueService } from './hl7-out-queue.service';
import { Hl7OutQueueBuilderService } from './hl7-out-queue-builder.service';
import { ServiceRequestModule } from '../service-request/service-request.module';
import { DeviceOutboundController } from '../device-outbound/device-outbound.controller';
import { DeviceOutboundService } from '../device-outbound/device-outbound.service';
import { AuthModule } from '../auth/auth.module';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { DeviceStainingMethodModule } from '../device-staining-method/device-staining-method.module';
import { StainingMethodModule } from '../staining-method/staining-method.module';
import { SampleTypeModule } from '../sample-type/sample-type.module';
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Hl7OutQueue]),
        ServiceRequestModule,
        AuthModule,
        DeviceStainingMethodModule,
        StainingMethodModule,
        SampleTypeModule,
        UserModule,
    ],
    providers: [
        CurrentUserContextService,
        Hl7OutQueueService,
        Hl7OutQueueBuilderService,
        DeviceOutboundService,
        {
            provide: 'IHl7OutQueueRepository',
            useClass: Hl7OutQueueRepository,
        },
    ],
    controllers: [DeviceOutboundController],
    exports: [Hl7OutQueueService, Hl7OutQueueBuilderService, 'IHl7OutQueueRepository'],
})
export class Hl7OutQueueModule {}
