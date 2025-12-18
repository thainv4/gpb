import { Entity, Column, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ServiceGroup } from '../../service-group/entities/service-group.entity';
import { UnitOfMeasure } from '../../unit-of-measure/entities/unit-of-measure.entity';

@Entity('BML_SERVICES')
@Index('IDX_SERVICES_CODE', ['serviceCode'], { unique: true })
@Index('IDX_SERVICES_GROUP', ['serviceGroupId'])
@Index('IDX_SERVICES_PARENT', ['parentServiceId'])
@Index('IDX_SERVICES_ORDER', ['numOrder'])
@Index('IDX_SERVICES_PRICE', ['currentPrice'])
export class Service extends BaseEntity {
    @Column({ name: 'SERVICE_CODE', unique: true, length: 50 })
    serviceCode: string;

    @Column({ name: 'SERVICE_NAME', length: 200 })
    serviceName: string;

    @Column({ name: 'SHORT_NAME', length: 100, nullable: true })
    shortName?: string;

    @Column({ name: 'SERVICE_GROUP_ID', type: 'varchar2', length: 36 })
    serviceGroupId: string;

    @Column({ name: 'UNIT_OF_MEASURE_ID', type: 'varchar2', length: 36, nullable: true })
    unitOfMeasureId?: string;

    @ManyToOne(() => UnitOfMeasure)
    @JoinColumn({ name: 'UNIT_OF_MEASURE_ID' })
    unitOfMeasure?: UnitOfMeasure;

    @Column({ name: 'MAPPING', type: 'clob', nullable: true })
    mapping?: string;

    @Column({ name: 'NUM_ORDER', type: 'number', default: 0 })
    numOrder: number;

    @Column({ name: 'CURRENT_PRICE', type: 'decimal', precision: 15, scale: 2, default: 0 })
    currentPrice: number;

    @Column({ name: 'PARENT_SERVICE_ID', type: 'varchar2', length: 36, nullable: true })
    parentServiceId?: string;

    @Column({ name: 'DESCRIPTION', type: 'clob', nullable: true })
    description?: string;

    @Column({ name: 'IS_ACTIVE', type: 'number', default: 1 })
    isActive: boolean;

    // Relationships
    @ManyToOne(() => ServiceGroup, serviceGroup => serviceGroup.services)
    @JoinColumn({ name: 'SERVICE_GROUP_ID' })
    serviceGroup: ServiceGroup;

    @ManyToOne(() => Service, service => service.subServices)
    @JoinColumn({ name: 'PARENT_SERVICE_ID' })
    parentService?: Service;

    @OneToMany(() => Service, service => service.parentService)
    subServices: Service[];

    // Business methods
    getFullServiceName(): string {
        return this.parentService ?
            `${this.parentService.serviceName} - ${this.serviceName}` :
            this.serviceName;
    }

    isSubService(): boolean {
        return !!this.parentServiceId;
    }

    getHierarchyLevel(): number {
        return this.parentService ? this.parentService.getHierarchyLevel() + 1 : 0;
    }

    isServiceActive(): boolean {
        return this.isActive && !this.deletedAt;
    }

    calculateTotalPrice(): number {
        if (this.subServices && this.subServices.length > 0) {
            return this.subServices.reduce((total, subService) =>
                total + subService.calculateTotalPrice(), this.currentPrice);
        }
        return this.currentPrice;
    }

    getSubServicesCount(): number {
        return this.subServices ? this.subServices.length : 0;
    }

    hasChildren(): boolean {
        return this.getSubServicesCount() > 0;
    }
}
