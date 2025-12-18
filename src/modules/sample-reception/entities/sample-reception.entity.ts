import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SampleType } from '../../sample-type/entities/sample-type.entity';

@Entity('BML_SAMPLE_RECEPTIONS')
export class SampleReception extends BaseEntity {
    @Column({ name: 'RECEPTION_CODE', unique: true })
    receptionCode: string; // BLOOD.20241024.0001

    @Column({ name: 'SAMPLE_TYPE_ID', type: 'varchar2', length: 36 })
    sampleTypeId: string;

    @Column({ name: 'RECEPTION_DATE', type: 'date' })
    receptionDate: Date;

    @Column({ name: 'SEQUENCE_NUMBER', type: 'number' })
    sequenceNumber: number; // 1, 2, 3...

    // Relationships
    @ManyToOne(() => SampleType)
    @JoinColumn({ name: 'SAMPLE_TYPE_ID' })
    sampleType: SampleType;

    // Business methods
    getFormattedCode(): string {
        return this.receptionCode;
    }

    getDateString(): string {
        return this.receptionDate.toISOString().slice(0, 10);
    }
}
