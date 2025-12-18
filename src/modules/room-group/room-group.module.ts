import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomGroup } from './entities/room-group.entity';
import { RoomGroupRepository } from './room-group.repository';
import { RoomGroupService } from './room-group.service';
import { RoomGroupController } from './room-group.controller';
import { ServicesModule } from '../../shared/services/services.module';
import { DataLoaderModule } from '../../shared/dataloaders/dataloader.module';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([RoomGroup]),
        ServicesModule,
        DataLoaderModule,
        AuthModule, // Import để sử dụng DualAuthGuard
    ],
    controllers: [RoomGroupController],
    providers: [
        RoomGroupService,
        CurrentUserContextService,
        {
            provide: 'IRoomGroupRepository',
            useClass: RoomGroupRepository,
        },
    ],
    exports: [
        RoomGroupService,
        'IRoomGroupRepository',
    ],
})
export class RoomGroupModule { }
