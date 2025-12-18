import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { HttpModule } from '@nestjs/axios';

// Config
import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';

// Modules
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProvinceModule } from './modules/province/province.module';
import { WardModule } from './modules/ward/ward.module';
import { BranchModule } from './modules/branch/branch.module';
import { DepartmentTypeModule } from './modules/department-type/department-type.module';
import { DepartmentModule } from './modules/department/department.module';
import { RoomGroupModule } from './modules/room-group/room-group.module';
import { RoomModule } from './modules/room/room.module';
import { SampleTypeModule } from './modules/sample-type/sample-type.module';
import { SampleReceptionModule } from './modules/sample-reception/sample-reception.module';
import { PatientModule } from './modules/patient/patient.module';
import { ServiceGroupModule } from './modules/service-group/service-group.module';
import { ProfileModule } from './modules/profile/profile.module';
import { UserRoomModule } from './modules/user-room/user-room.module';
import { ServiceModule } from './modules/service/service.module';
import { ServiceRequestModule } from './modules/service-request/service-request.module';
import { HisDatabaseModule } from './modules/his-database/his-database.module';
import { UnitOfMeasureModule } from './modules/unit-of-measure/unit-of-measure.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { WorkflowHistoryModule } from './modules/workflow/workflow-history/workflow-history.module';
import { EmrModule } from './modules/emr/emr.module';
import { ResultTemplateModule } from './modules/result-template/result-template.module';
import { HealthController } from './health.controller';

// Shared
import { DataLoaderModule } from './shared/dataloaders/dataloader.module';
import { ServicesModule } from './shared/services/services.module';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        // Database
        TypeOrmModule.forRoot(databaseConfig),

        // JWT
        JwtModule.registerAsync(jwtConfig),

        // Passport
        PassportModule.register({ defaultStrategy: 'jwt' }),

        // HTTP
        HttpModule.register({
            timeout: 30000,
            maxRedirects: 5,
        }),

        // Shared modules
        DataLoaderModule,
        ServicesModule,
        HisDatabaseModule,

        // Feature modules
        UserModule,
        AuthModule,
        ProvinceModule,
        WardModule,
        BranchModule,
        DepartmentTypeModule,
        DepartmentModule,
        RoomGroupModule,
        RoomModule,
        SampleTypeModule,
        SampleReceptionModule,
        PatientModule,
        ServiceGroupModule,
        ProfileModule,
        UserRoomModule,
        ServiceModule,
        ServiceRequestModule,
        UnitOfMeasureModule,
        WorkflowModule,
        WorkflowHistoryModule,
        EmrModule,
        ResultTemplateModule,
    ],
    controllers: [HealthController],
    providers: [],
})
export class AppModule { }
