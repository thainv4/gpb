import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HisPacsController } from './his-pacs.controller';
import { HisPacsService } from './his-pacs.service';
import { HisSereServ } from '../service-request/entities/his-sere-serv.entity';
import { HisDatabaseModule } from '../his-database/his-database.module';
import { HisSereServModule } from '../his-sere-serv/his-sere-serv.module';

@Module({
    imports: [
        HttpModule.register({
            timeout: 60000,
            maxRedirects: 5,
        }),
        HisDatabaseModule,
        HisSereServModule,
        TypeOrmModule.forFeature(
            [HisSereServ],
            'hisConnection' // Use HIS database connection
        ),
    ],
    controllers: [HisPacsController],
    providers: [HisPacsService],
    exports: [HisPacsService],
})
export class HisPacsModule { }
