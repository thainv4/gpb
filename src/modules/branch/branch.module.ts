import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { BranchRepository } from './branch.repository';
import { Branch } from './entities/branch.entity';
import { ProvinceModule } from '../province/province.module';
import { WardModule } from '../ward/ward.module';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Branch]),
        ProvinceModule, // Import ProvinceModule để sử dụng ProvinceService
        WardModule,     // Import WardModule để sử dụng WardService
        AuthModule, // Import để sử dụng DualAuthGuard
    ],
    controllers: [BranchController],
    providers: [
        BranchService,
        CurrentUserContextService,
        {
            provide: 'IBranchRepository',
            useClass: BranchRepository,
        },
    ],
    exports: [BranchService],
})
export class BranchModule { }
