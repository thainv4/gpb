import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('BML_SR_AUDIT_LOG')
@Index('IDX_SR_AUDIT_SVC_RESULT', ['storedServiceId', 'eventCode', 'occurredAt'])
@Index('IDX_SR_AUDIT_TIME', ['occurredAt'])
@Index('IDX_SR_AUDIT_ROOM_TIME', ['actionRoomId', 'occurredAt'])
@Index('IDX_SR_AUDIT_REQ_TIME', ['storedServiceReqId', 'occurredAt'])
@Index('IDX_SR_AUDIT_CODE', ['serviceReqCode'])
@Index('IDX_SR_AUDIT_HIS_CODE', ['hisServiceReqCode'])
export class ServiceRequestAuditLog extends BaseEntity {
    @Column({ name: 'OCCURRED_AT', type: 'timestamp' })
    occurredAt: Date;

    @Column({ name: 'EVENT_CATEGORY', type: 'varchar2', length: 20 })
    eventCategory: string;

    @Column({ name: 'EVENT_CODE', type: 'varchar2', length: 50 })
    eventCode: string;

    @Column({ name: 'EVENT_TITLE', type: 'varchar2', length: 200 })
    eventTitle: string;

    @Column({ name: 'SUMMARY', type: 'varchar2', length: 1000, nullable: true })
    summary?: string | null;

    @Column({ name: 'NOTES', type: 'varchar2', length: 1000, nullable: true })
    notes?: string | null;

    @Column({ name: 'PAYLOAD', type: 'clob', nullable: true })
    payload?: string | null;

    @Column({ name: 'SCOPE', type: 'varchar2', length: 10 })
    scope: string;

    @Column({ name: 'STORED_SERVICE_REQ_ID', type: 'varchar2', length: 36 })
    storedServiceReqId: string;

    @Column({ name: 'STORED_SERVICE_ID', type: 'varchar2', length: 36, nullable: true })
    storedServiceId?: string | null;

    @Column({ name: 'ACTION_USER_ID', type: 'varchar2', length: 36 })
    actionUserId: string;

    @Column({ name: 'ACTION_USERNAME', type: 'varchar2', length: 50, nullable: true })
    actionUsername?: string | null;

    @Column({ name: 'ACTION_USER_FULL_NAME', type: 'varchar2', length: 200, nullable: true })
    actionUserFullName?: string | null;

    @Column({ name: 'ACTION_ROOM_ID', type: 'varchar2', length: 36, nullable: true })
    actionRoomId?: string | null;

    @Column({ name: 'ACTION_ROOM_NAME', type: 'varchar2', length: 200, nullable: true })
    actionRoomName?: string | null;

    @Column({ name: 'SERVICE_REQ_CODE', type: 'varchar2', length: 50, nullable: true })
    serviceReqCode?: string | null;

    @Column({ name: 'HIS_SERVICE_REQ_CODE', type: 'varchar2', length: 50, nullable: true })
    hisServiceReqCode?: string | null;

    @Column({ name: 'RECEPTION_CODE', type: 'varchar2', length: 50, nullable: true })
    receptionCode?: string | null;

    @Column({ name: 'PATIENT_CODE', type: 'varchar2', length: 50, nullable: true })
    patientCode?: string | null;

    @Column({ name: 'PATIENT_NAME', type: 'varchar2', length: 200, nullable: true })
    patientName?: string | null;

    @Column({ name: 'SERVICE_NAME', type: 'varchar2', length: 500, nullable: true })
    serviceName?: string | null;

    @Column({ name: 'CORRELATION_ID', type: 'varchar2', length: 36, nullable: true })
    correlationId?: string | null;
}
