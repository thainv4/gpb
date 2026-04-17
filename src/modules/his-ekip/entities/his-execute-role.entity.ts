import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('HIS_EXECUTE_ROLE')
export class HisExecuteRole {
    @PrimaryColumn({ name: 'ID', type: 'number' })
    id: number;

    @Column({ name: 'EXECUTE_ROLE_NAME', type: 'varchar2', length: 200 })
    executeRoleName: string;

    @Column({ name: 'IS_ACTIVE', type: 'number', nullable: true })
    isActive?: number;
}
