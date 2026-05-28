import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceRequestAuditLog } from '../../entities/service-request-audit-log.entity';

export class AuditLogResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    occurredAt: Date;

    @ApiProperty()
    eventCategory: string;

    @ApiProperty()
    eventCode: string;

    @ApiProperty()
    eventTitle: string;

    @ApiPropertyOptional()
    summary?: string | null;

    @ApiPropertyOptional()
    notes?: string | null;

    @ApiPropertyOptional({ description: 'JSON object' })
    payload?: Record<string, unknown> | null;

    @ApiProperty()
    scope: string;

    @ApiProperty()
    storedServiceReqId: string;

    @ApiPropertyOptional()
    storedServiceId?: string | null;

    @ApiProperty()
    actionUserId: string;

    @ApiPropertyOptional()
    actionUsername?: string | null;

    @ApiPropertyOptional()
    actionUserFullName?: string | null;

    @ApiPropertyOptional()
    actionRoomId?: string | null;

    @ApiPropertyOptional()
    actionRoomName?: string | null;

    @ApiPropertyOptional()
    serviceReqCode?: string | null;

    @ApiPropertyOptional()
    hisServiceReqCode?: string | null;

    @ApiPropertyOptional()
    receptionCode?: string | null;

    @ApiPropertyOptional()
    patientCode?: string | null;

    @ApiPropertyOptional()
    patientName?: string | null;

    @ApiPropertyOptional()
    serviceName?: string | null;

    @ApiPropertyOptional()
    correlationId?: string | null;

    static fromEntity(entity: ServiceRequestAuditLog, includePayload = true): AuditLogResponseDto {
        let payload: Record<string, unknown> | null = null;
        if (includePayload && entity.payload) {
            try {
                payload = JSON.parse(entity.payload) as Record<string, unknown>;
            } catch {
                payload = null;
            }
        }
        return {
            id: entity.id,
            occurredAt: entity.occurredAt,
            eventCategory: entity.eventCategory,
            eventCode: entity.eventCode,
            eventTitle: entity.eventTitle,
            summary: entity.summary,
            notes: entity.notes,
            payload: includePayload ? payload : null,
            scope: entity.scope,
            storedServiceReqId: entity.storedServiceReqId,
            storedServiceId: entity.storedServiceId,
            actionUserId: entity.actionUserId,
            actionUsername: entity.actionUsername,
            actionUserFullName: entity.actionUserFullName,
            actionRoomId: entity.actionRoomId,
            actionRoomName: entity.actionRoomName,
            serviceReqCode: entity.serviceReqCode,
            hisServiceReqCode: entity.hisServiceReqCode,
            receptionCode: entity.receptionCode,
            patientCode: entity.patientCode,
            patientName: entity.patientName,
            serviceName: entity.serviceName,
            correlationId: entity.correlationId,
        };
    }
}

export class LatestResultSaveAuditDto {
    @ApiProperty()
    storedServiceId: string;

    @ApiProperty()
    occurredAt: Date;

    @ApiProperty()
    actionUserId: string;

    @ApiPropertyOptional()
    actionUsername?: string | null;

    @ApiPropertyOptional()
    actionUserFullName?: string | null;
}
