import { ServiceRequestAuditLog } from '../entities/service-request-audit-log.entity';

export interface FindAuditLogsParams {
    fromDate?: Date;
    toDate?: Date;
    code?: string;
    patientName?: string;
    roomId?: string;
    roomIds?: string[];
    eventCategories?: string[];
    eventCodes?: string[];
    limit: number;
    offset: number;
}

export interface IServiceRequestAuditLogRepository {
    save(entity: ServiceRequestAuditLog): Promise<ServiceRequestAuditLog>;
    findById(id: string): Promise<ServiceRequestAuditLog | null>;
    findMany(params: FindAuditLogsParams): Promise<{ items: ServiceRequestAuditLog[]; total: number }>;
    findLatestByEventCode(storedServiceId: string, eventCode: string): Promise<ServiceRequestAuditLog | null>;
    findLatestByReqAndEventCode(
        storedServiceReqId: string,
        eventCode: string,
    ): Promise<ServiceRequestAuditLog | null>;
}
