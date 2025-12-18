import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('BML_SERVICE_GROUPS')
@Index('IDX_BML_SG_CODE', ['serviceGroupCode'])
@Index('IDX_BML_SG_NAME', ['serviceGroupName'])
@Index('IDX_BML_SG_ACTIVE', ['isActive'])
@Index('IDX_BML_SG_SORT', ['sortOrder'])
export class ServiceGroup extends BaseEntity {

    @Column({ name: 'SERVICE_GROUP_CODE', unique: true, length: 20 })
    serviceGroupCode: string;

    @Column({ name: 'SERVICE_GROUP_NAME', length: 100 })
    serviceGroupName: string;

    @Column({ name: 'SHORT_NAME', length: 50, nullable: true })
    shortName?: string;

    @Column({ name: 'MAPPING', type: 'varchar2', length: 2000, nullable: true })
    mapping?: string;

    @Column({ name: 'DESCRIPTION', type: 'clob', nullable: true })
    description?: string;

    @Column({ name: 'IS_ACTIVE', default: true })
    isActive: boolean;

    @Column({ name: 'SORT_ORDER', type: 'int', default: 0 })
    sortOrder: number;

    @Column({ name: 'ICON', type: 'varchar2', length: 100, nullable: true })
    icon?: string; // Icon cho UI

    @Column({ name: 'COLOR', type: 'varchar2', length: 7, nullable: true })
    color?: string; // Màu sắc cho UI (hex code)

    // One-to-Many relationship with Service
    @OneToMany('Service', 'serviceGroup')
    services: any[];

    // Business methods
    getDisplayName(): string {
        return `${this.serviceGroupCode} - ${this.serviceGroupName}`;
    }

    getShortDisplayName(): string {
        return this.shortName || this.serviceGroupName;
    }

    isServiceGroupActive(): boolean {
        return this.isActive && !this.deletedAt;
    }

    // Validation methods
    validateServiceGroupCode(): boolean {
        return /^[A-Z0-9_]{2,20}$/.test(this.serviceGroupCode);
    }

    validateServiceGroupName(): boolean {
        return this.serviceGroupName && this.serviceGroupName.trim().length >= 2;
    }

    validateMapping(): boolean {
        if (!this.mapping) return true;
        try {
            JSON.parse(this.mapping);
            return true;
        } catch {
            return false;
        }
    }

    validateColor(): boolean {
        if (!this.color) return true;
        return /^#[0-9A-Fa-f]{6}$/.test(this.color);
    }

    // Helper methods
    toJSON() {
        return {
            id: this.id,
            serviceGroupCode: this.serviceGroupCode,
            serviceGroupName: this.serviceGroupName,
            shortName: this.shortName,
            mapping: this.mapping,
            description: this.description,
            isActive: this.isActive,
            sortOrder: this.sortOrder,
            icon: this.icon,
            color: this.color,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy,
            updatedBy: this.updatedBy,
            version: this.version,
        };
    }
}
