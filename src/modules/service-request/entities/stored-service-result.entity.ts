import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { StoredServiceRequestService } from './stored-service-request-service.entity';

@Entity('BML_STORED_SERVICE_RESULT')
@Index('IDX_SSR_RESULT_SERVICE', ['storedSrServiceId'])
@Index('IDX_SSR_RESULT_DOC', ['documentId'])
export class StoredServiceResult extends BaseEntity {
    @Column({ name: 'STORED_SR_SERVICE_ID', type: 'varchar2', length: 36 })
    storedSrServiceId: string;

    @Column({ name: 'DOCUMENT_ID', type: 'number', nullable: true })
    documentId?: number;

    @Column({ name: 'DESCRIPTION', type: 'nvarchar2', nullable: true })
    description?: string;

    @Column({ name: 'CONCLUDE', type: 'nvarchar2', nullable: true })
    conclude?: string;

    @Column({ name: 'NOTE', type: 'nvarchar2', nullable: true })
    note?: string;

    // Relations
    @ManyToOne(() => StoredServiceRequestService, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'STORED_SR_SERVICE_ID' })
    storedServiceRequestService: StoredServiceRequestService;
}
