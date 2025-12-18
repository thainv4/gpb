import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('V_HIS_SERVICE_REQ') // Mapping to the actual VIEW
export class ServiceRequestView {
  // Service Request Info
  @PrimaryColumn({ name: 'ID', type: 'number' })
  id: number;

  @Column({ name: 'SERVICE_REQ_CODE', type: 'varchar2', length: 50 })
  serviceReqCode: string;

  @Column({ name: 'SERVICE_REQ_STT_ID', type: 'number' })
  serviceReqSttId: number;

  @Column({ name: 'SERVICE_REQ_STT_CODE', type: 'varchar2', length: 10 })
  serviceReqSttCode: string;

  @Column({ name: 'SERVICE_REQ_TYPE_ID', type: 'number' })
  serviceReqTypeId: number;

  @Column({ name: 'SERVICE_REQ_TYPE_CODE', type: 'varchar2', length: 10 })
  serviceReqTypeCode: string;

  @Column({ name: 'INTRUCTION_TIME', type: 'number' })
  instructionTime: number;

  @Column({ name: 'INTRUCTION_DATE', type: 'number' })
  instructionDate: number;

  @Column({ name: 'ICD_CODE', type: 'varchar2', length: 20, nullable: true })
  icdCode?: string;

  @Column({ name: 'ICD_NAME', type: 'varchar2', length: 500, nullable: true })
  icdName?: string;

  @Column({ name: 'ICD_SUB_CODE', type: 'varchar2', length: 20, nullable: true })
  icdSubCode?: string;

  @Column({ name: 'ICD_TEXT', type: 'varchar2', length: 1000, nullable: true })
  icdText?: string;

  @Column({ name: 'TREATMENT_ID', type: 'number' })
  treatmentId: number;

  @Column({ name: 'TDL_TREATMENT_CODE', type: 'varchar2', length: 50 })
  treatmentCode: string;

  @Column({ name: 'NOTE', type: 'varchar2', length: 1000, nullable: true })
  note?: string;

  // Request Location
  @Column({ name: 'REQUEST_ROOM_ID', type: 'number' })
  requestRoomId: number;

  @Column({ name: 'REQUEST_ROOM_CODE', type: 'varchar2', length: 50 })
  requestRoomCode: string;

  @Column({ name: 'REQUEST_ROOM_NAME', type: 'varchar2', length: 200 })
  requestRoomName: string;

  @Column({ name: 'REQUEST_DEPARTMENT_ID', type: 'number' })
  requestDepartmentId: number;

  @Column({ name: 'REQUEST_DEPARTMENT_CODE', type: 'varchar2', length: 50 })
  requestDepartmentCode: string;

  @Column({ name: 'REQUEST_DEPARTMENT_NAME', type: 'varchar2', length: 200 })
  requestDepartmentName: string;

  // Execute Location
  @Column({ name: 'EXECUTE_ROOM_ID', type: 'number' })
  executeRoomId: number;

  @Column({ name: 'EXECUTE_ROOM_CODE', type: 'varchar2', length: 50 })
  executeRoomCode: string;

  @Column({ name: 'EXECUTE_ROOM_NAME', type: 'varchar2', length: 200 })
  executeRoomName: string;

  @Column({ name: 'EXECUTE_DEPARTMENT_ID', type: 'number' })
  executeDepartmentId: number;

  @Column({ name: 'EXECUTE_DEPARTMENT_CODE', type: 'varchar2', length: 50 })
  executeDepartmentCode: string;

  @Column({ name: 'EXECUTE_DEPARTMENT_NAME', type: 'varchar2', length: 200 })
  executeDepartmentName: string;

  // Patient Info
  @Column({ name: 'TDL_PATIENT_ID', type: 'number' })
  patientId: number;

  @Column({ name: 'TDL_PATIENT_CODE', type: 'varchar2', length: 50 })
  patientCode: string;

  @Column({ name: 'TDL_PATIENT_NAME', type: 'varchar2', length: 200 })
  patientName: string;

  @Column({ name: 'TDL_PATIENT_DOB', type: 'number' })
  patientDob: number;

  @Column({ name: 'TDL_PATIENT_CCCD_NUMBER', type: 'varchar2', length: 20, nullable: true })
  patientCmndNumber?: string;

  @Column({ name: 'TDL_PATIENT_CCCD_DATE', type: 'number', nullable: true })
  patientCmndDate?: number;

  @Column({ name: 'TDL_PATIENT_CCCD_PLACE', type: 'varchar2', length: 200, nullable: true })
  patientCmndPlace?: string;

  @Column({ name: 'TDL_PATIENT_RELATIVE_MOBILE', type: 'varchar2', length: 20, nullable: true })
  patientMobile?: string;

  @Column({ name: 'TDL_PATIENT_RELATIVE_PHONE', type: 'varchar2', length: 20, nullable: true })
  patientPhone?: string;

  @Column({ name: 'TDL_PATIENT_PROVINCE_CODE', type: 'varchar2', length: 10, nullable: true })
  patientProvinceCode?: string;

  @Column({ name: 'TDL_PATIENT_PROVINCE_NAME', type: 'varchar2', length: 200, nullable: true })
  patientProvinceName?: string;

  @Column({ name: 'TDL_PATIENT_COMMUNE_CODE', type: 'varchar2', length: 20, nullable: true })
  patientCommuneCode?: string;

  @Column({ name: 'TDL_PATIENT_COMMUNE_NAME', type: 'varchar2', length: 200, nullable: true })
  patientCommuneName?: string;

  @Column({ name: 'TDL_PATIENT_ADDRESS', type: 'varchar2', length: 500, nullable: true })
  patientAddress?: string;

  @Column({ name: 'TDL_PATIENT_GENDER_ID', type: 'number' })
  patientGenderId: number;

  @Column({ name: 'TDL_PATIENT_GENDER_NAME', type: 'varchar2', length: 50 })
  patientGenderName: string;

  @Column({ name: 'TDL_PATIENT_CAREER_NAME', type: 'varchar2', length: 200, nullable: true })
  patientCareerName?: string;

  // Service Info (from HIS_SERE_SERV)
  @Column({ name: 'HIS_SERE_SERV_ID', type: 'number' })
  hisSereServId: number;

  @Column({ name: 'SERVICE_ID', type: 'number' })
  serviceId: number;

  @Column({ name: 'TDL_SERVICE_CODE', type: 'varchar2', length: 50 })
  serviceCode: string;

  @Column({ name: 'TDL_SERVICE_NAME', type: 'varchar2', length: 200 })
  serviceName: string;

  @Column({ name: 'PRICE', type: 'decimal', precision: 15, scale: 2 })
  price: number;

  // Business methods
  getRequestLocationDisplay(): string {
    return `${this.requestRoomName} - ${this.requestDepartmentName}`;
  }

  getExecuteLocationDisplay(): string {
    return `${this.executeRoomName} - ${this.executeDepartmentName}`;
  }

  getPatientDisplayName(): string {
    return `${this.patientName} (${this.patientCode})`;
  }

  getFullAddress(): string {
    const parts = [this.patientAddress, this.patientCommuneName, this.patientProvinceName];
    return parts.filter(part => part).join(', ');
  }

  getIcdDisplayName(): string {
    return this.icdCode && this.icdName ? `${this.icdCode} - ${this.icdName}` : '';
  }

  getServiceDisplayName(): string {
    return `${this.serviceName} (${this.serviceCode})`;
  }

  getPriceDisplay(): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(this.price);
  }
}
