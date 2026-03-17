import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * Bảng lưu dữ liệu xuất ra thiết bị (máy nhuộm, máy quét...).
 * Block_ID = RECEPTION_CODE + 'A' + blockNumber (vd: S2601.0312A.2)
 * SLIDE_ID = RECEPTION_CODE + 'A' + blockNumber + '.' + slideNumber (vd: S2601.0312A.2.3)
 */
@Entity('BML_DEVICE_OUTBOUND')
@Index('IDX_BML_DEVOUT_REC', ['receptionCode'])
@Index('IDX_BML_DEVOUT_SVC', ['serviceCode'])
export class DeviceOutbound extends BaseEntity {
    @Column({ name: 'RECEPTION_CODE', type: 'varchar2', length: 50 })
    receptionCode: string;

    @Column({ name: 'SERVICE_CODE', type: 'varchar2', length: 50 })
    serviceCode: string;

    @Column({ name: 'BLOCK_ID', type: 'varchar2', length: 100 })
    blockId: string;

    @Column({ name: 'SLIDE_ID', type: 'varchar2', length: 100 })
    slideId: string;

    @Column({ name: 'METHOD', type: 'varchar2', length: 50 })
    method: string;
}
