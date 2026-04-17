import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HisEkipController } from './his-ekip.controller';
import { HisEkipService } from './his-ekip.service';
import { HisExecuteRole } from './entities/his-execute-role.entity';
import { HisEkipUser } from './entities/his-ekip-user.entity';
import { HisDatabaseModule } from '../his-database/his-database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        HisDatabaseModule,
        AuthModule,
        TypeOrmModule.forFeature([HisExecuteRole, HisEkipUser], 'hisConnection'),
    ],
    controllers: [HisEkipController],
    providers: [HisEkipService],
    exports: [HisEkipService],
})
export class HisEkipModule {}
