import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('BML_STORED_SIGNED_DOCUMENTS')
@Index('IDX_SSD_SERVICE_REQ_ID', ['storedServiceReqId'])
@Index('IDX_SSD_HIS_CODE', ['hisServiceReqCode'])
@Index('IDX_SSD_DOCUMENT_ID', ['documentId'])
export class StoredSignedDocument extends BaseEntity {
    @Column({ name: 'STORED_SERVICE_REQ_ID', type: 'varchar2', length: 36 })
    storedServiceReqId: string;

    @Column({ name: 'HIS_SERVICE_REQ_CODE', type: 'varchar2', length: 50 })
    hisServiceReqCode: string;

    @Column({ name: 'DOCUMENT_ID', type: 'number', nullable: true })
    documentId?: number | null;

    @Column({ name: 'SIGNED_DOCUMENT_BASE64', type: 'clob', nullable: true })
    signedDocumentBase64?: string | null;
}
