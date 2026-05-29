import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('BML_SAMPLE_REJECTIONS')
export class SampleRejection extends BaseEntity {
    @Column({ name: 'PATIENT_NAME', type: 'nvarchar2', length: 200 })
    patientName: string;

    @Column({ name: 'DATE_OF_BIRTH', type: 'date' })
    dateOfBirth: Date;

    @Column({ name: 'GENDER', type: 'nvarchar2', length: 20 })
    gender: string;

    @Column({ name: 'DIAGNOSIS', type: 'nvarchar2', length: 500 })
    diagnosis: string;

    @Column({ name: 'TEST_INDICATION', type: 'nvarchar2', length: 500 })
    testIndication: string;

    @Column({ name: 'ORDERING_DOCTOR', type: 'nvarchar2', length: 200 })
    orderingDoctor: string;

    @Column({ name: 'PATIENT_ADDRESS', type: 'nvarchar2', length: 500 })
    patientAddress: string;

    @Column({ name: 'SAMPLE_CODE', type: 'nvarchar2', length: 100 })
    sampleCode: string;

    @Column({ name: 'SAMPLING_SITE', type: 'nvarchar2', length: 200 })
    samplingSite: string;

    @Column({ name: 'SAMPLING_METHOD', type: 'nvarchar2', length: 200 })
    samplingMethod: string;

    @Column({ name: 'REJECTION_TIME', type: 'timestamp' })
    rejectionTime: Date;

    @Column({ name: 'REJECTION_REASON', type: 'nvarchar2', length: 1000 })
    rejectionReason: string;
}
