import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('HIS_EKIP_USER')
export class HisEkipUser {
    @PrimaryColumn({ name: 'ID', type: 'number' })
    id: number;

    @Column({ name: 'USERNAME', type: 'varchar2', length: 100, nullable: true })
    username?: string;

    @Column({ name: 'LOGINNAME', type: 'varchar2', length: 50 })
    loginname: string;

    @Column({ name: 'EXECUTE_ROLE_ID', type: 'number' })
    executeRoleId: number;

    @Column({ name: 'DEPARTMENT_ID', type: 'number', nullable: true })
    departmentId?: number;

    @Column({ name: 'IS_ACTIVE', type: 'number', nullable: true })
    isActive?: number;
}
