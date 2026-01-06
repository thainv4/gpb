import { Entity, Column, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { StoredServiceRequest } from './stored-service-request.entity';

@Entity('BML_STORED_SR_SERVICES')
@Index('IDX_SSR_SERVICES_REQ', ['storedServiceRequestId'])
@Index('IDX_SSR_SERVICES_PARENT', ['parentServiceId'])
@Index('IDX_SSR_SERVICES_CODE', ['serviceCode'])
export class StoredServiceRequestService extends BaseEntity {
    // References
    @Column({ name: 'STORED_SERVICE_REQ_ID', type: 'varchar2', length: 36 })
    storedServiceRequestId: string;

    @Column({ name: 'PARENT_SERVICE_ID', type: 'varchar2', length: 36, nullable: true })
    parentServiceId?: string | null;

    // HIS Service Info
    @Column({ name: 'HIS_SERE_SERV_ID', type: 'number', nullable: true })
    hisSereServId?: number;

    @Column({ name: 'SERVICE_ID', type: 'number', nullable: true })
    serviceId?: number;

    @Column({ name: 'SERVICE_CODE', type: 'varchar2', length: 50, nullable: true })
    serviceCode?: string;

    @Column({ name: 'SERVICE_NAME', type: 'varchar2', length: 200, nullable: true })
    serviceName?: string;

    @Column({ name: 'PRICE', type: 'number', precision: 15, scale: 2, nullable: true })
    price?: number;

    // LIS Service Info
    @Column({ name: 'LIS_SERVICE_ID', type: 'varchar2', length: 36, nullable: true })
    lisServiceId?: string | null;

    @Column({ name: 'UOM_ID', type: 'varchar2', length: 36, nullable: true })
    unitOfMeasureId?: string | null;

    @Column({ name: 'UOM_CODE', type: 'varchar2', length: 50, nullable: true })
    unitOfMeasureCode?: string | null;

    @Column({ name: 'UOM_NAME', type: 'varchar2', length: 200, nullable: true })
    unitOfMeasureName?: string | null;

    // Additional fields
    @Column({ name: 'RANGE_TEXT', type: 'varchar2', length: 500, nullable: true })
    rangeText?: string | null;

    @Column({ name: 'RANGE_LOW', type: 'number', precision: 15, scale: 2, nullable: true })
    rangeLow?: number | null;

    @Column({ name: 'RANGE_HIGH', type: 'number', precision: 15, scale: 2, nullable: true })
    rangeHigh?: number | null;

    @Column({ name: 'MAPPING', type: 'clob', nullable: true })
    mapping?: string | null;

    @Column({ name: 'TEST_ORDER', type: 'number', nullable: true })
    testOrder?: number | null;

    @Column({ name: 'SHORT_NAME', type: 'varchar2', length: 100, nullable: true })
    shortName?: string | null;

    @Column({ name: 'DESCRIPTION', type: 'clob', nullable: true })
    description?: string | null;

    @Column({ name: 'RESULT_TEXT', type: 'clob', nullable: true })
    resultText?: string | null; // Kết quả xét nghiệm (3-5 trang A4)

    @Column({ name: 'RESULT_NAME', type: 'varchar2', length: 200, nullable: true })
    resultName?: string | null; // Tên kết quả xét nghiệm

    // Result Value & Status
    @Column({ name: 'RESULT_VALUE', type: 'number', precision: 15, scale: 4, nullable: true })
    resultValue?: number | null;

    @Column({ name: 'RESULT_VALUE_TEXT', type: 'varchar2', length: 500, nullable: true })
    resultValueText?: string | null;

    @Column({ name: 'RESULT_STATUS', type: 'varchar2', length: 20, nullable: true })
    resultStatus?: string | null; // NORMAL, ABNORMAL, CRITICAL, PENDING

    @Column({ name: 'IS_NORMAL', type: 'number', default: 0, nullable: true })
    isNormal?: number | null; // 1 = bình thường, 0 = bất thường

    // Result Timestamps
    @Column({ name: 'RESULT_ENTERED_AT', type: 'timestamp', nullable: true })
    resultEnteredAt?: Date | null;

    @Column({ name: 'RESULT_REVIEWED_AT', type: 'timestamp', nullable: true })
    resultReviewedAt?: Date | null;

    @Column({ name: 'RESULT_APPROVED_AT', type: 'timestamp', nullable: true })
    resultApprovedAt?: Date | null;

    @Column({ name: 'RESULT_COMPLETED_AT', type: 'timestamp', nullable: true })
    resultCompletedAt?: Date | null;

    // Result Users - Audit
    @Column({ name: 'RESULT_ENTERED_BY_USER_ID', type: 'varchar2', length: 36, nullable: true })
    resultEnteredByUserId?: string | null;

    @Column({ name: 'RESULT_REVIEWED_BY_USER_ID', type: 'varchar2', length: 36, nullable: true })
    resultReviewedByUserId?: string | null;

    @Column({ name: 'RESULT_APPROVED_BY_USER_ID', type: 'varchar2', length: 36, nullable: true })
    resultApprovedByUserId?: string | null;

    // Result Notes & Metadata
    @Column({ name: 'RESULT_NOTES', type: 'varchar2', length: 1000, nullable: true })
    resultNotes?: string | null;

    @Column({ name: 'RESULT_METADATA', type: 'clob', nullable: true })
    resultMetadata?: string | null; // JSON metadata

    // Quality Control
    @Column({ name: 'QC_STATUS', type: 'varchar2', length: 20, nullable: true })
    qcStatus?: string | null; // PASSED, FAILED, PENDING

    @Column({ name: 'QC_CHECKED_BY_USER_ID', type: 'varchar2', length: 36, nullable: true })
    qcCheckedByUserId?: string | null;

    @Column({ name: 'QC_CHECKED_AT', type: 'timestamp', nullable: true })
    qcCheckedAt?: Date | null;

    // Sample Collection Info (NEW)
    @Column({ name: 'RECEPTION_CODE', type: 'varchar2', length: 50, nullable: true })
    receptionCode?: string | null;

    @Column({ name: 'SAMPLE_TYPE_NAME', type: 'varchar2', length: 200, nullable: true })
    sampleTypeName?: string | null;

    @Column({ name: 'SAMPLE_COLL_TIME', type: 'timestamp', nullable: true })
    sampleCollectionTime?: Date | null;

    @Column({ name: 'COLLECTED_BY_USER_ID', type: 'varchar2', length: 36, nullable: true })
    collectedByUserId?: string | null;

    // Child-specific fields (chỉ có giá trị khi PARENT_SERVICE_ID IS NOT NULL)
    @Column({ name: 'TEST_ID', type: 'varchar2', length: 36, nullable: true })
    testId?: string | null;

    @Column({ name: 'IS_ACTIVE', type: 'number', nullable: true })
    isActive?: number | null;

    @Column({ name: 'TEST_CREATED_AT', type: 'timestamp', nullable: true })
    testCreatedAt?: Date | null;

    @Column({ name: 'TEST_UPDATED_AT', type: 'timestamp', nullable: true })
    testUpdatedAt?: Date | null;

    @Column({ name: 'TEST_CREATED_BY', type: 'varchar2', length: 50, nullable: true })
    testCreatedBy?: string | null;

    @Column({ name: 'TEST_UPDATED_BY', type: 'varchar2', length: 50, nullable: true })
    testUpdatedBy?: string | null;

    @Column({ name: 'TEST_VERSION', type: 'number', nullable: true })
    testVersion?: number | null;

    // Service Type Flag
    @Column({ name: 'IS_CHILD_SERVICE', type: 'number', default: 0 })
    isChildService: number; // 0 = parent, 1 = child

    // EMR Document ID
    @Column({ name: 'DOCUMENT_ID', type: 'number', nullable: true })
    documentId?: number | null; // ID văn bản EMR (từ bảng EMR_DOCUMENT)

    // Relationships
    @ManyToOne(() => StoredServiceRequest, sr => sr.services)
    @JoinColumn({ name: 'STORED_SERVICE_REQ_ID' })
    storedServiceRequest: StoredServiceRequest;

    @ManyToOne(() => StoredServiceRequestService, service => service.children)
    @JoinColumn({ name: 'PARENT_SERVICE_ID' })
    parentService?: StoredServiceRequestService;

    @OneToMany(() => StoredServiceRequestService, service => service.parentService)
    children: StoredServiceRequestService[];

    // Business methods
    isParent(): boolean {
        return this.isChildService === 0 && !this.parentServiceId;
    }

    isChild(): boolean {
        return this.isChildService === 1 && !!this.parentServiceId;
    }
}

