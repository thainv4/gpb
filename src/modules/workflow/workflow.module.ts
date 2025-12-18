import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowState } from './entities/workflow-state.entity';
import { WorkflowStateController } from './controllers/workflow-state.controller';
import { WorkflowStateService } from './services/workflow-state.service';
import { WorkflowStateRepository } from './repositories/workflow-state.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([WorkflowState]),
        AuthModule, // Import để sử dụng DualAuthGuard
    ],
    controllers: [WorkflowStateController],
    providers: [
        WorkflowStateService,
        {
            provide: 'IWorkflowStateRepository',
            useClass: WorkflowStateRepository,
        },
    ],
    exports: [WorkflowStateService, 'IWorkflowStateRepository'],
})
export class WorkflowModule { }

