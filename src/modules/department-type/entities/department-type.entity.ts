import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('BML_DEPARTMENT_TYPES')
@Index('IDX_BML_DEPT_TYPES_CODE', ['typeCode'])
@Index('IDX_BML_DEPT_TYPES_NAME', ['typeName'])
@Index('IDX_BML_DEPT_TYPES_ACTIVE', ['isActive'])
@Index('IDX_BML_DEPT_TYPES_SORT', ['sortOrder'])
export class DepartmentType extends BaseEntity {

    @Column({ name: 'TYPE_CODE', unique: true, length: 20 })
    typeCode: string;

    @Column({ name: 'TYPE_NAME', length: 100 })
    typeName: string;

    @Column({ name: 'DESCRIPTION', type: 'clob', nullable: true })
    description?: string;

    @Column({ name: 'IS_ACTIVE', default: true })
    isActive: boolean;

    @Column({ name: 'SORT_ORDER', type: 'int', default: 0 })
    sortOrder: number;


    // One-to-Many relationship with Department
    @OneToMany('Department', 'departmentType')
    departments: any[];

    // Business methods
    getDisplayName(): string {
        return `${this.typeCode} - ${this.typeName}`;
    }

    getShortDisplayName(): string {
        return this.typeName;
    }

    isActiveDepartmentType(): boolean {
        return this.isActive && !this.deletedAt;
    }
}
