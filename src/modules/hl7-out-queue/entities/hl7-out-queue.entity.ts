import { Entity, Column, PrimaryColumn, BeforeInsert, Index } from 'typeorm';
import { randomUUID } from 'crypto';

@Entity('BML_HL7_OUT_QUEUE')
@Index('IDX_HL7_STATUS', ['status'])
@Index('IDX_OUT_RETRY', ['retryCount'])
export class Hl7OutQueue {
    @PrimaryColumn({ name: 'ID', type: 'raw', length: 16 })
    id: Buffer;

    @Column({ name: 'PATIENT_ID', type: 'varchar2', length: 50, nullable: true })
    patientId?: string;

    @Column({ name: 'PATIENT_FAMILY', type: 'varchar2', length: 100, nullable: true })
    patientFamily?: string;

    @Column({ name: 'PATIENT_GIVEN', type: 'varchar2', length: 100, nullable: true })
    patientGiven?: string;

    @Column({ name: 'PATIENT_DOB', type: 'date', nullable: true })
    patientDob?: Date;

    @Column({ name: 'PATIENT_GENDER', type: 'varchar2', length: 10, nullable: true })
    patientGender?: string;

    @Column({ name: 'PHYSICIAN_ID', type: 'varchar2', length: 50, nullable: true })
    physicianId?: string;

    @Column({ name: 'PHYSICIAN_FAMILY', type: 'varchar2', length: 100, nullable: true })
    physicianFamily?: string;

    @Column({ name: 'PHYSICIAN_GIVEN', type: 'varchar2', length: 100, nullable: true })
    physicianGiven?: string;

    @Column({ name: 'REGISTRATION_DATE', type: 'number', nullable: true })
    registrationDate?: number;

    @Column({ name: 'ORDER_CONTROL', type: 'varchar2', length: 10, nullable: true })
    orderControl?: string;

    @Column({ name: 'LIS_CASE_ID', type: 'varchar2', length: 50, nullable: true })
    lisCaseId?: string;

    @Column({ name: 'APPROVE_PHYSICIAN_ID', type: 'varchar2', length: 50, nullable: true })
    approvePhysicianId?: string;

    @Column({ name: 'APPROVE_PHYSICIAN_FAMILY', type: 'varchar2', length: 100, nullable: true })
    approvePhysicianFamily?: string;

    @Column({ name: 'APPROVE_PHYSICIAN_GIVEN', type: 'varchar2', length: 100, nullable: true })
    approvePhysicianGiven?: string;

    @Column({ name: 'TEST_CODE', type: 'varchar2', length: 50, nullable: true })
    testCode?: string;

    @Column({ name: 'TEST_VANTAGE_CODE', type: 'varchar2', length: 200, nullable: true })
    testVantageCode?: string;

    @Column({ name: 'TEST_DESCRIPTION', type: 'varchar2', length: 500, nullable: true })
    testDescription?: string;

    @Column({ name: 'RECEIVED_DATE', type: 'date', nullable: true })
    receivedDate?: Date;

    @Column({ name: 'TISSUE_NAME', type: 'varchar2', length: 200, nullable: true })
    tissueName?: string;

    @Column({ name: 'TEST_FLAG_NAME', type: 'varchar2', length: 200, nullable: true })
    testFlagName?: string;

    @Column({ name: 'TISSUE_SUB_NAME', type: 'varchar2', length: 200, nullable: true })
    tissueSubName?: string;

    @Column({ name: 'PATHOLOGIST_ID', type: 'varchar2', length: 50, nullable: true })
    pathologistId?: string;

    @Column({ name: 'PATHOLOGIST_FAMILY', type: 'varchar2', length: 100, nullable: true })
    pathologistFamily?: string;

    @Column({ name: 'PATHOLOGIST_GIVEN', type: 'varchar2', length: 100, nullable: true })
    pathologistGiven?: string;

    @Column({ name: 'SLIDE_ID', type: 'varchar2', length: 50, nullable: true })
    slideId?: string;

    @Column({ name: 'SLIDE_NUMBER', type: 'number', nullable: true })
    slideNumber?: number;

    @Column({ name: 'BLOCK_ID', type: 'varchar2', length: 50, nullable: true })
    blockId?: string;

    @Column({ name: 'BLOCK_NUMBER', type: 'number', nullable: true })
    blockNumber?: number;

    @Column({ name: 'SPECIMEN_ID', type: 'varchar2', length: 50, nullable: true })
    specimenId?: string;

    @Column({ name: 'SPECIMEN_NUMBER', type: 'varchar2', length: 20, nullable: true })
    specimenNumber?: string;

    @Column({ name: 'GROSS_DESCRIPTION_TEXT', type: 'clob', nullable: true })
    grossDescriptionText?: string;

    @Column({ name: 'MESSAGE_TYPE', type: 'varchar2', length: 20, nullable: true })
    messageType?: string;

    @Column({ name: 'STATUS', type: 'number', precision: 1, scale: 0, default: 0 })
    status: number;

    @Column({ name: 'CREATED_TIME', type: 'timestamp', default: () => 'SYSTIMESTAMP' })
    createdTime: Date;

    @Column({ name: 'SENT_TIME', type: 'timestamp', nullable: true })
    sentTime?: Date;

    @Column({ name: 'ERROR_MESSAGE', type: 'clob', nullable: true })
    errorMessage?: string;

    @Column({ name: 'RETRY_COUNT', type: 'number', precision: 2, scale: 0, default: 0 })
    retryCount: number;

    @Column({ name: 'TISSUE_DESCRIPTION', type: 'varchar2', length: 200, nullable: true })
    tissueDescription?: string;

    @Column({ name: 'TISSUE_PROCEDURE', type: 'varchar2', length: 200, nullable: true })
    tissueProcedure?: string;

    @Column({ name: 'SLIDES_JSON', type: 'clob', nullable: true })
    slidesJson?: string;

    @BeforeInsert()
    generateIdIfMissing() {
        if (!this.id) {
            const hex = randomUUID().replace(/-/g, '');
            this.id = Buffer.from(hex, 'hex');
        }
        if (this.status == null) {
            this.status = 0;
        }
        if (this.retryCount == null) {
            this.retryCount = 0;
        }
        if (!this.createdTime) {
            this.createdTime = new Date();
        }
    }
}
