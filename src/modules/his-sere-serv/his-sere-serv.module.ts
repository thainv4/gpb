import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HisSereServController } from './his-sere-serv.controller';
import { HisSereServService } from './his-sere-serv.service';
import { HisSereServ } from '../service-request/entities/his-sere-serv.entity';
import { HisDatabaseModule } from '../his-database/his-database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        HisDatabaseModule,
        AuthModule,
        TypeOrmModule.forFeature(
            [HisSereServ],
            'hisConnection' // Use HIS database connection
        ),
    ],
    controllers: [HisSereServController],
    providers: [HisSereServService],
    exports: [HisSereServService],
})
export class HisSereServModule { }
