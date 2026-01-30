import { Entity, Column, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Branch } from '../../branch/entities/branch.entity';
import { DepartmentType } from '../../department-type/entities/department-type.entity';
import { Room } from '../../room/entities/room.entity';

@Entity('BML_DEPARTMENTS')
@Index('IDX_BML_DEPT_CODE', ['departmentCode'])
@Index('IDX_BML_DEPT_NAME', ['departmentName'])
@Index('IDX_BML_DEPT_BRANCH', ['branchId'])
@Index('IDX_BML_DEPT_TYPE', ['departmentTypeId'])
@Index('IDX_BML_DEPT_PARENT', ['parentDepartmentId'])
@Index('IDX_BML_DEPT_ACTIVE', ['isActive'])
@Index('IDX_BML_DEPT_SORT', ['sortOrder'])
export class Department extends BaseEntity {

    @Column({ name: 'DEPARTMENT_CODE', unique: true, length: 20 })
    departmentCode: string;

    @Column({ name: 'DEPARTMENT_NAME', length: 100 })
    departmentName: string;

    @Column({ name: 'BRANCH_ID', type: 'uuid' })
    branchId: string;

    @Column({ name: 'HEAD_OF_DEPARTMENT', length: 100, nullable: true })
    headOfDepartment?: string;

    @Column({ name: 'HEAD_NURSE', length: 100, nullable: true })
    headNurse?: string;

    @Column({ name: 'PARENT_DEPARTMENT_ID', type: 'uuid', nullable: true })
    parentDepartmentId?: string;

    @Column({ name: 'SHORT_NAME', length: 50, nullable: true })
    shortName?: string;

    @Column({ name: 'DEPARTMENT_TYPE_ID', type: 'uuid' })
    departmentTypeId: string;

    @Column({ name: 'IS_ACTIVE', default: true })
    isActive: boolean;

    @Column({ name: 'SORT_ORDER', type: 'int', default: 0 })
    sortOrder: number;

    @Column({ name: 'RESULT_FORM_TYPE', type: 'number', nullable: true })
    resultFormType?: number;

    // Relationships
    @ManyToOne(() => Branch, branch => branch.departments)
    @JoinColumn({ name: 'BRANCH_ID' })
    branch: Branch;

    @ManyToOne(() => DepartmentType, departmentType => departmentType.departments)
    @JoinColumn({ name: 'DEPARTMENT_TYPE_ID' })
    departmentType: DepartmentType;

    @ManyToOne(() => Department, department => department.children)
    @JoinColumn({ name: 'PARENT_DEPARTMENT_ID' })
    parent: Department;

    @OneToMany(() => Department, department => department.parent)
    children: Department[];

    @OneToMany(() => Room, room => room.department)
    rooms: Room[];

    // Business methods
    getDisplayName(): string {
        return `${this.departmentCode} - ${this.departmentName}`;
    }

    getFullName(): string {
        return this.departmentName;
    }

    isRootDepartment(): boolean {
        return !this.parentDepartmentId;
    }

    hasChildren(): boolean {
        return this.children && this.children.length > 0;
    }

    getHierarchyLevel(): number {
        let level = 0;
        let current = this.parent;
        while (current) {
            level++;
            current = current.parent;
        }
        return level;
    }
}
