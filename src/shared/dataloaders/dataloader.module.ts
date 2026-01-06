import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataLoaderService } from './dataloader.service';
import { User } from '../../modules/user/entities/user.entity';
import { Province } from '../../modules/province/entities/province.entity';
import { Ward } from '../../modules/ward/entities/ward.entity';
import { Branch } from '../../modules/branch/entities/branch.entity';
import { Department } from '../../modules/department/entities/department.entity';
import { UserRepository } from '../../modules/user/user.repository';
import { ProvinceRepository } from '../../modules/province/province.repository';
import { WardRepository } from '../../modules/ward/ward.repository';
import { BranchRepository } from '../../modules/branch/branch.repository';
import { DepartmentRepository } from '../../modules/department/department.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Province, Ward, Branch, Department]),
    ],
    providers: [
        DataLoaderService,
        {
            provide: 'IUserRepository',
            useClass: UserRepository,
        },
        {
            provide: 'IProvinceRepository',
            useClass: ProvinceRepository,
        },
        {
            provide: 'IWardRepository',
            useClass: WardRepository,
        },
        {
            provide: 'IBranchRepository',
            useClass: BranchRepository,
        },
        {
            provide: 'IDepartmentRepository',
            useClass: DepartmentRepository,
        },
    ],
    exports: [DataLoaderService],
})
export class DataLoaderModule { }
