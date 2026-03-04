import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('BML_TESTING_METHOD_GEN')
export class TestingMethodGen extends BaseEntity {
    @Column({ name: 'METHOD_NAME', type: 'varchar2', length: 50 })
    methodName: string;
}
