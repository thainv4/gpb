import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('BML_SAMPLE_TYPES')
export class SampleType extends BaseEntity {
    @Column({ name: 'TYPE_CODE', unique: true })
    typeCode: string;

    @Column({ name: 'TYPE_NAME' })
    typeName: string;

    @Column({ name: 'SHORT_NAME', nullable: true })
    shortName?: string;

    @Column({ name: 'DESCRIPTION', type: 'varchar2', length: 2000, nullable: true })
    description?: string;

    @Column({ name: 'SORT_ORDER', type: 'number', default: 0 })
    sortOrder: number;

    @Column({ name: 'CODE_PREFIX', length: 5 })
    codePrefix: string;

    @Column({ name: 'CODE_WIDTH', type: 'number', default: 4 })
    codeWidth: number;

    @Column({ name: 'ALLOW_DUPLICATE', type: 'number', default: 0 })
    allowDuplicate: boolean;

    @Column({ name: 'RESET_PERIOD', type: 'varchar2', length: 20, default: 'MONTHLY' })
    resetPeriod: 'DAILY' | 'MONTHLY' | 'YEARLY' | 'NEVER';

    // Business methods
    getDisplayName(): string {
        return `${this.typeCode} - ${this.typeName}`;
    }

    getCodeGenerationInfo(): string {
        return `${this.codePrefix} (${this.codeWidth} digits, ${this.allowDuplicate ? 'duplicate allowed' : 'unique'}, ${this.resetPeriod})`;
    }
}
