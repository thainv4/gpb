import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('BML_WORKFLOW_STATES')
@Index('IDX_WF_STATES_CODE', ['stateCode'])
@Index('IDX_WF_STATES_ORDER', ['stateOrder'])
@Index('IDX_WF_STATES_ACTIVE', ['isActive'])
export class WorkflowState extends BaseEntity {
    @Column({ name: 'STATE_CODE', type: 'varchar2', length: 50, unique: true })
    stateCode: string;

    @Column({ name: 'STATE_NAME', type: 'varchar2', length: 200 })
    stateName: string;

    @Column({ name: 'STATE_DESCRIPTION', type: 'varchar2', length: 1000, nullable: true })
    stateDescription?: string;

    @Column({ name: 'STATE_ORDER', type: 'number' })
    stateOrder: number;

    @Column({ name: 'CAN_SKIP', type: 'number', default: 0 })
    canSkip: number; // 0 = không thể bỏ qua, 1 = có thể bỏ qua

    @Column({ name: 'REQUIRES_APPROVAL', type: 'number', default: 0 })
    requiresApproval: number; // 0 = không cần phê duyệt, 1 = cần phê duyệt

    @Column({ name: 'IS_ACTIVE', type: 'number', default: 1 })
    isActive: number;

    // Business methods
    canBeSkipped(): boolean {
        return this.canSkip === 1;
    }

    needsApproval(): boolean {
        return this.requiresApproval === 1;
    }

    isStateActive(): boolean {
        return this.isActive === 1 && !this.deletedAt;
    }
}

