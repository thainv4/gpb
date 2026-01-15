import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StainingMethod } from './entities/staining-method.entity';
import { StainingMethodController } from './staining-method.controller';
import { StainingMethodService } from './staining-method.service';
import { StainingMethodRepository } from './repositories/staining-method.repository';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([StainingMethod]),
        AuthModule,
    ],
    controllers: [StainingMethodController],
    providers: [
        StainingMethodService,
        CurrentUserContextService,
        {
            provide: 'IStainingMethodRepository',
            useClass: StainingMethodRepository,
        },
    ],
    exports: [
        StainingMethodService,
        'IStainingMethodRepository',
    ],
})
export class StainingMethodModule { }
