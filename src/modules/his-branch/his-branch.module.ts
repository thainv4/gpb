import { Module } from '@nestjs/common';
import { HisBranchController } from './his-branch.controller';
import { HisBranchService } from './his-branch.service';
import { HisDatabaseModule } from '../his-database/his-database.module';

@Module({
    imports: [
        HisDatabaseModule, // hisConnection để query HIS_BRANCH
    ],
    controllers: [HisBranchController],
    providers: [HisBranchService],
})
export class HisBranchModule { }
