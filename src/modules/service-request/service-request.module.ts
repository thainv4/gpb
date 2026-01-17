import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRequestService } from './services/service-request.service';
import { StoredServiceRequestService } from './services/stored-service-request.service';
import { ServiceRequestController } from './controllers/service-request.controller';
import { ServiceRequestView } from './entities/service-request-view.entity';
import { HisSereServ } from './entities/his-sere-serv.entity';
import { StoredServiceRequest } from './entities/stored-service-request.entity';
import { StoredServiceRequestService as StoredServiceRequestServiceEntity } from './entities/stored-service-request-service.entity';
import { ServiceRequestRepository } from './repositories/service-request.repository';
import { StoredServiceRequestRepository } from './repositories/stored-service-request.repository';
import { StoredServiceRequestServiceRepository } from './repositories/stored-service-request-service.repository';
import { HisDatabaseModule } from '../his-database/his-database.module';
import { Department } from '../department/entities/department.entity';
import { Room } from '../room/entities/room.entity';
import { Patient } from '../patient/entities/patient.entity';
import { Province } from '../province/entities/province.entity';
import { Ward } from '../ward/entities/ward.entity';
import { Service } from '../service/entities/service.entity';
import { UnitOfMeasureModule } from '../unit-of-measure/unit-of-measure.module';
import { WorkflowHistoryModule } from '../workflow/workflow-history/workflow-history.module';
import { WorkflowModule } from '../workflow/workflow.module';
import { AuthModule } from '../auth/auth.module';
import { SampleReceptionModule } from '../sample-reception/sample-reception.module';
import { StainingMethodModule } from '../staining-method/staining-method.module';

@Module({
    imports: [
        HisDatabaseModule,
        UnitOfMeasureModule,
        WorkflowHistoryModule, // Import để inject WorkflowHistoryService
        WorkflowModule, // Import để inject IWorkflowStateRepository
        AuthModule, // Import để sử dụng DualAuthGuard
        SampleReceptionModule, // Import để inject ISampleReceptionRepository
        StainingMethodModule, // Import để inject IStainingMethodRepository
        TypeOrmModule.forFeature(
            [ServiceRequestView, HisSereServ],
            'hisConnection' // Use HIS database connection
        ),
        TypeOrmModule.forFeature([Department, Room, Patient, Province, Ward, Service]),
        TypeOrmModule.forFeature([StoredServiceRequest, StoredServiceRequestServiceEntity]), // LIS entities
    ],
    controllers: [ServiceRequestController],
    providers: [
        ServiceRequestService,
        StoredServiceRequestService,
        {
            provide: 'IServiceRequestRepository',
            useClass: ServiceRequestRepository,
        },
        {
            provide: 'IStoredServiceRequestRepository',
            useClass: StoredServiceRequestRepository,
        },
        {
            provide: 'IStoredServiceRequestServiceRepository',
            useClass: StoredServiceRequestServiceRepository,
        },
    ],
    exports: [
        ServiceRequestService, 
        StoredServiceRequestService,
        'IStoredServiceRequestServiceRepository', // Export repository token for use in other modules
        'IStoredServiceRequestRepository', // Export repository token for use in other modules
    ],
})
export class ServiceRequestModule { }
