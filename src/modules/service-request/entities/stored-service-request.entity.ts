import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { StoredServiceRequestService } from './stored-service-request-service.entity';

@Entity('BML_STORED_SERVICE_REQUESTS')
@Index('IDX_SSR_CODE', ['serviceReqCode'])
@Index('IDX_SSR_HIS_CODE', ['hisServiceReqCode'])
export class StoredServiceRequest extends BaseEntity {
    // Reference to HIS
    @Column({ name: 'HIS_SERVICE_REQ_CODE', type: 'varchar2', length: 50 })
    hisServiceReqCode: string;

    @Column({ name: 'HIS_SERVICE_REQ_ID', type: 'number', nullable: true })
    hisServiceReqId?: number;

    // Service Request Info
    @Column({ name: 'SERVICE_REQ_CODE', type: 'varchar2', length: 50, unique: true })
    serviceReqCode: string;

    @Column({ name: 'SERVICE_REQ_STT_ID', type: 'number', nullable: true })
    serviceReqSttId?: number;

    @Column({ name: 'SERVICE_REQ_STT_CODE', type: 'varchar2', length: 10, nullable: true })
    serviceReqSttCode?: string;

    @Column({ name: 'SERVICE_REQ_TYPE_ID', type: 'number', nullable: true })
    serviceReqTypeId?: number;

    @Column({ name: 'SERVICE_REQ_TYPE_CODE', type: 'varchar2', length: 10, nullable: true })
    serviceReqTypeCode?: string;

    @Column({ name: 'INSTRUCTION_TIME', type: 'number', nullable: true })
    instructionTime?: number;

    @Column({ name: 'INSTRUCTION_DATE', type: 'number', nullable: true })
    instructionDate?: number;

    @Column({ name: 'ICD_CODE', type: 'varchar2', length: 20, nullable: true })
    icdCode?: string;

    @Column({ name: 'ICD_NAME', type: 'varchar2', length: 500, nullable: true })
    icdName?: string;

    @Column({ name: 'ICD_SUB_CODE', type: 'varchar2', length: 20, nullable: true })
    icdSubCode?: string;

    @Column({ name: 'ICD_TEXT', type: 'varchar2', length: 1000, nullable: true })
    icdText?: string;

    @Column({ name: 'TREATMENT_ID', type: 'number', nullable: true })
    treatmentId?: number;

    @Column({ name: 'TREATMENT_CODE', type: 'varchar2', length: 50, nullable: true })
    treatmentCode?: string;

    @Column({ name: 'NOTE', type: 'varchar2', length: 1000, nullable: true })
    note?: string;

    // Request Location
    @Column({ name: 'REQUEST_ROOM_ID', type: 'number', nullable: true })
    requestRoomId?: number;

    @Column({ name: 'REQUEST_ROOM_CODE', type: 'varchar2', length: 50, nullable: true })
    requestRoomCode?: string;

    @Column({ name: 'REQUEST_ROOM_NAME', type: 'varchar2', length: 200, nullable: true })
    requestRoomName?: string;

    @Column({ name: 'REQUEST_ROOM_LIS_ID', type: 'varchar2', length: 36, nullable: true })
    requestRoomLisId?: string;

    @Column({ name: 'REQUEST_DEPARTMENT_ID', type: 'number', nullable: true })
    requestDepartmentId?: number;

    @Column({ name: 'REQUEST_DEPARTMENT_CODE', type: 'varchar2', length: 50, nullable: true })
    requestDepartmentCode?: string;

    @Column({ name: 'REQUEST_DEPARTMENT_NAME', type: 'varchar2', length: 200, nullable: true })
    requestDepartmentName?: string;

    @Column({ name: 'REQUEST_DEPARTMENT_LIS_ID', type: 'varchar2', length: 36, nullable: true })
    requestDepartmentLisId?: string;

    // Execute Location
    @Column({ name: 'EXECUTE_ROOM_ID', type: 'number', nullable: true })
    executeRoomId?: number;

    @Column({ name: 'EXECUTE_ROOM_CODE', type: 'varchar2', length: 50, nullable: true })
    executeRoomCode?: string;

    @Column({ name: 'EXECUTE_ROOM_NAME', type: 'varchar2', length: 200, nullable: true })
    executeRoomName?: string;

    @Column({ name: 'EXECUTE_ROOM_LIS_ID', type: 'varchar2', length: 36, nullable: true })
    executeRoomLisId?: string;

    @Column({ name: 'EXECUTE_DEPARTMENT_ID', type: 'number', nullable: true })
    executeDepartmentId?: number;

    @Column({ name: 'EXECUTE_DEPARTMENT_CODE', type: 'varchar2', length: 50, nullable: true })
    executeDepartmentCode?: string;

    @Column({ name: 'EXECUTE_DEPARTMENT_NAME', type: 'varchar2', length: 200, nullable: true })
    executeDepartmentName?: string;

    @Column({ name: 'EXECUTE_DEPARTMENT_LIS_ID', type: 'varchar2', length: 36, nullable: true })
    executeDepartmentLisId?: string;

    // Patient Info
    @Column({ name: 'PATIENT_ID', type: 'number', nullable: true })
    patientId?: number;

    @Column({ name: 'PATIENT_CODE', type: 'varchar2', length: 50, nullable: true })
    patientCode?: string;

    @Column({ name: 'PATIENT_NAME', type: 'varchar2', length: 200, nullable: true })
    patientName?: string;

    @Column({ name: 'PATIENT_DOB', type: 'number', nullable: true })
    patientDob?: number;

    @Column({ name: 'PATIENT_CMND_NUMBER', type: 'varchar2', length: 20, nullable: true })
    patientCmndNumber?: string;

    @Column({ name: 'PATIENT_CMND_DATE', type: 'number', nullable: true })
    patientCmndDate?: number;

    @Column({ name: 'PATIENT_CMND_PLACE', type: 'varchar2', length: 200, nullable: true })
    patientCmndPlace?: string;

    @Column({ name: 'PATIENT_MOBILE', type: 'varchar2', length: 20, nullable: true })
    patientMobile?: string;

    @Column({ name: 'PATIENT_PHONE', type: 'varchar2', length: 20, nullable: true })
    patientPhone?: string;

    @Column({ name: 'PATIENT_PROVINCE_CODE', type: 'varchar2', length: 10, nullable: true })
    patientProvinceCode?: string;

    @Column({ name: 'PATIENT_PROVINCE_NAME', type: 'varchar2', length: 200, nullable: true })
    patientProvinceName?: string;

    @Column({ name: 'PATIENT_PROVINCE_LIS_ID', type: 'varchar2', length: 36, nullable: true })
    patientProvinceLisId?: string;

    @Column({ name: 'PATIENT_COMMUNE_CODE', type: 'varchar2', length: 20, nullable: true })
    patientCommuneCode?: string;

    @Column({ name: 'PATIENT_COMMUNE_NAME', type: 'varchar2', length: 200, nullable: true })
    patientCommuneName?: string;

    @Column({ name: 'PATIENT_COMMUNE_LIS_ID', type: 'varchar2', length: 36, nullable: true })
    patientCommuneLisId?: string;

    @Column({ name: 'PATIENT_ADDRESS', type: 'varchar2', length: 500, nullable: true })
    patientAddress?: string;

    @Column({ name: 'PATIENT_GENDER_ID', type: 'number', nullable: true })
    patientGenderId?: number;

    @Column({ name: 'PATIENT_GENDER_NAME', type: 'varchar2', length: 50, nullable: true })
    patientGenderName?: string;

    @Column({ name: 'PATIENT_CAREER_NAME', type: 'varchar2', length: 200, nullable: true })
    patientCareerName?: string;

    @Column({ name: 'PATIENT_LIS_ID', type: 'varchar2', length: 36, nullable: true })
    patientLisId?: string;

    // Context When Storing (NEW)
    @Column({ name: 'CURRENT_ROOM_ID', type: 'varchar2', length: 36, nullable: true })
    currentRoomId?: string;

    @Column({ name: 'CURRENT_DEPARTMENT_ID', type: 'varchar2', length: 36, nullable: true })
    currentDepartmentId?: string;

    // Metadata
    @Column({ name: 'RAW_RESPONSE_JSON', type: 'clob', nullable: true })
    rawResponseJson?: string | null;

    @Column({ name: 'STORED_AT', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    storedAt: Date;

    @Column({ name: 'STORED_BY', type: 'varchar2', length: 50, nullable: true })
    storedBy?: string;

    // Relationships
    @OneToMany(() => StoredServiceRequestService, service => service.storedServiceRequest)
    services: StoredServiceRequestService[];
}

