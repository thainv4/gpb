import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getHisDatabaseConfig } from '../../config/his-database.config';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            name: 'hisConnection',
            imports: [ConfigModule],
            useFactory: getHisDatabaseConfig,
            inject: [ConfigService],
        }),
    ],
    exports: [TypeOrmModule],
})
export class HisDatabaseModule { }
