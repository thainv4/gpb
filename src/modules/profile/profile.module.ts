import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { ProfileRepository } from './profile.repository';
import { DataLoaderModule } from '../../shared/dataloaders/dataloader.module';
import { ServicesModule } from '../../common/services/services.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Profile]),
        DataLoaderModule,
        ServicesModule,
        forwardRef(() => AuthModule), // Sử dụng forwardRef để tránh circular dependency
    ],
    controllers: [ProfileController],
    providers: [
        ProfileService,
        {
            provide: 'IProfileRepository',
            useClass: ProfileRepository,
        },
    ],
    exports: [
        ProfileService,
        'IProfileRepository',
    ],
})
export class ProfileModule { }
