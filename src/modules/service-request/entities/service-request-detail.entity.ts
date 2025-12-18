import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ServiceRequest } from './service-request.entity';
import { ServiceTest } from './service-test.entity';

@Entity('HIS_SERE_SERV')
export class ServiceRequestDetail {
    @PrimaryColumn({ name: 'ID', type: 'number' })
    hisSereServId: number;

    @Column({ name: 'SERVICE_REQ_ID', type: 'number' })
    serviceRequestId: number;

    @Column({ name: 'SERVICE_ID', type: 'number' })
    serviceId: number;

    @Column({ name: 'TDL_SERVICE_CODE', type: 'varchar2', length: 50 })
    serviceCode: string;

    @Column({ name: 'TDL_SERVICE_NAME', type: 'varchar2', length: 200 })
    serviceName: string;

    @Column({ name: 'PRICE', type: 'decimal', precision: 15, scale: 2 })
    price: number;

    // Relationships
    @ManyToOne(() => ServiceRequest, serviceRequest => serviceRequest.serviceDetails)
    @JoinColumn({ name: 'SERVICE_REQ_ID' })
    serviceRequest: ServiceRequest;

    @OneToMany(() => ServiceTest, test => test.serviceRequestDetail)
    serviceTests: ServiceTest[];

    // Business methods
    getServiceDisplayName(): string {
        return `${this.serviceName} (${this.serviceCode})`;
    }

    getPriceDisplay(): string {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(this.price);
    }
}