import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('BML_STAINING_METHOD')
export class StainingMethod extends BaseEntity {
    @Column({ name: 'METHOD_NAME', type: 'varchar2', length: 200 })
    methodName: string;
}
