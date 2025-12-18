import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ServiceRequestDetail } from './service-request-detail.entity';

@Entity('HIS_SERVICE_TESTS')
export class ServiceTest {
    @PrimaryColumn({ name: 'ID', type: 'number' })
    id: number;

    @Column({ name: 'SERVICE_REQUEST_DETAIL_ID', type: 'number' })
    serviceRequestDetailId: number;

    @Column({ name: 'TEST_CODE', type: 'varchar2', length: 50 })
    testCode: string;

    @Column({ name: 'TEST_NAME', type: 'varchar2', length: 200 })
    testName: string;

    @ManyToOne(() => ServiceRequestDetail, detail => detail.serviceTests)
    @JoinColumn({ name: 'SERVICE_REQUEST_DETAIL_ID' })
    serviceRequestDetail: ServiceRequestDetail;

    // Business methods
    getTestDisplayName(): string {
        return `${this.testName} (${this.testCode})`;
    }
}