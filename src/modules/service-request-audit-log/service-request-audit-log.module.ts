import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRequestAuditLog } from './entities/service-request-audit-log.entity';
import { ServiceRequestAuditLogRepository } from './repositories/service-request-audit-log.repository';
import { ServiceRequestAuditLogService } from './services/service-request-audit-log.service';
import { AuditSuppressContext } from './helpers/audit-suppress.context';
import { ServiceRequestAuditLogController } from './controllers/service-request-audit-log.controller';
import { StoredServiceRequest } from '../service-request/entities/stored-service-request.entity';
import { StoredServiceRequestService } from '../service-request/entities/stored-service-request-service.entity';
import { UserModule } from '../user/user.module';
import { UserRoomModule } from '../user-room/user-room.module';
import { RoomModule } from '../room/room.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ServiceRequestAuditLog,
            StoredServiceRequest,
            StoredServiceRequestService,
        ]),
        UserModule,
        UserRoomModule,
        RoomModule,
        AuthModule,
    ],
    controllers: [ServiceRequestAuditLogController],
    providers: [
        AuditSuppressContext,
        ServiceRequestAuditLogService,
        {
            provide: 'IServiceRequestAuditLogRepository',
            useClass: ServiceRequestAuditLogRepository,
        },
    ],
    exports: [ServiceRequestAuditLogService, AuditSuppressContext],
})
export class ServiceRequestAuditLogModule {}
