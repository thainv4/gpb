import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { StoredServiceRequestService } from '../../service-request/entities/stored-service-request-service.entity';

@Entity('BML_PIVKA_RESULTS')
export class PivkaResult extends BaseEntity {
    @Column({ name: 'STORED_SR_SERVICES_ID', type: 'varchar2', length: 36 })
    storedSrServicesId: string;

    @ManyToOne(() => StoredServiceRequestService, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'STORED_SR_SERVICES_ID' })
    storedSrService?: StoredServiceRequestService;

    // Kết quả số thập phân từ FE thường là chuỗi (vd: "0.12", "<=0.1", ">10")
    @Column({ name: 'PIVKA_II_RESULT', type: 'varchar2', length: 50, nullable: true })
    pivkaIiResult?: string;

    @Column({ name: 'AFP_FULL_RESULT', type: 'varchar2', length: 50, nullable: true })
    afpFullResult?: string;

    @Column({ name: 'AFP_L3', type: 'varchar2', length: 50, nullable: true })
    afpL3?: string;
}
