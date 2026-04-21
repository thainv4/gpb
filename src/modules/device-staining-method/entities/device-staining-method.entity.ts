import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('BML_DEVICE_STAINING_METHOD')
export class DeviceStainingMethod extends BaseEntity {
    @Column({ name: 'METHOD_NAME', type: 'nvarchar2', length: 50 })
    methodName: string;
}
