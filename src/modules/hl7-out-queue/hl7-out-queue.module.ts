import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hl7OutQueue } from './entities/hl7-out-queue.entity';
import { Hl7OutQueueRepository } from './repositories/hl7-out-queue.repository';
import { Hl7OutQueueService } from './hl7-out-queue.service';

@Module({
    imports: [TypeOrmModule.forFeature([Hl7OutQueue])],
    providers: [
        Hl7OutQueueService,
        {
            provide: 'IHl7OutQueueRepository',
            useClass: Hl7OutQueueRepository,
        },
    ],
    exports: [Hl7OutQueueService, 'IHl7OutQueueRepository'],
})
export class Hl7OutQueueModule {}
