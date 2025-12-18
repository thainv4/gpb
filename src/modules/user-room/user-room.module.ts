import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRoom } from './entities/user-room.entity';
import { UserRoomService } from './user-room.service';
import { UserRoomController } from './user-room.controller';
import { UserRoomRepository } from './user-room.repository';
import { DataLoaderModule } from '../../shared/dataloaders/dataloader.module';
import { ServicesModule } from '../../shared/services/services.module';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserRoom]),
        DataLoaderModule,
        ServicesModule,
        AuthModule, // Import để sử dụng DualAuthGuard
    ],
    controllers: [UserRoomController],
    providers: [
        UserRoomService,
        {
            provide: 'IUserRoomRepository',
            useClass: UserRoomRepository,
        },
        UserRoomRepository,
        CurrentUserContextService,
    ],
    exports: [UserRoomService, 'IUserRoomRepository'],
})
export class UserRoomModule { }
