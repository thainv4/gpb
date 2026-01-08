import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowHistory } from './entities/workflow-history.entity';
import { WorkflowHistoryController } from './controllers/workflow-history.controller';
import { WorkflowHistoryService } from './services/workflow-history.service';
import { WorkflowHistoryRepository } from './repositories/workflow-history.repository';
import { WorkflowModule } from '../workflow.module'; // Import để lấy IWorkflowStateRepository
import { UserModule } from '../../user/user.module'; // Import để lấy IUserRepository
import { AuthModule } from '../../auth/auth.module'; // Import để sử dụng DualAuthGuard
import { StoredServiceRequest } from '../../service-request/entities/stored-service-request.entity'; // Import entity để join
import { StoredServiceRequestService } from '../../service-request/entities/stored-service-request-service.entity'; // Import entity để check documentId

@Module({
    imports: [
        TypeOrmModule.forFeature([WorkflowHistory, StoredServiceRequest, StoredServiceRequestService]), // ✅ Thêm StoredServiceRequestService để check documentId
        WorkflowModule, // Để access IWorkflowStateRepository
        UserModule, // Để access IUserRepository
        AuthModule, // Import để sử dụng DualAuthGuard
    ],
    controllers: [WorkflowHistoryController],
    providers: [
        WorkflowHistoryService,
        {
            provide: 'IWorkflowHistoryRepository',
            useClass: WorkflowHistoryRepository,
        },
    ],
    exports: [WorkflowHistoryService, 'IWorkflowHistoryRepository'],
})
export class WorkflowHistoryModule { }

