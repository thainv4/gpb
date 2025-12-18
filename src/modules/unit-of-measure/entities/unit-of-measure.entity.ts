import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('BML_UNITS_OF_MEASURE')
@Index(['unitOfMeasureCode'], { unique: true })
export class UnitOfMeasure extends BaseEntity {
    @Column({ name: 'UNIT_OF_MEASURE_CODE', type: 'varchar2', length: 50, unique: true })
    unitOfMeasureCode: string;

    @Column({ name: 'UNIT_OF_MEASURE_NAME', type: 'varchar2', length: 200 })
    unitOfMeasureName: string;

    @Column({ name: 'DESCRIPTION', type: 'varchar2', length: 1000, nullable: true })
    description?: string;

    @Column({ name: 'MAPPING', type: 'clob', nullable: true })
    mapping?: string | null;
}


