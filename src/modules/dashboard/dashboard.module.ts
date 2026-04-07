import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { WorkflowHistoryModule } from '../workflow/workflow-history/workflow-history.module';
import { ServiceRequestModule } from '../service-request/service-request.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [WorkflowHistoryModule, ServiceRequestModule, AuthModule],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule {}
