import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../common/entities/base.entity';
import { WorkflowState } from '../../entities/workflow-state.entity';

@Entity('BML_WORKFLOW_HISTORY')
@Index('IDX_WF_HISTORY_REQ', ['storedServiceReqId'])
@Index('IDX_WF_HISTORY_SERVICE', ['storedServiceId'])
@Index('IDX_WF_HISTORY_CURRENT', ['isCurrent'])
@Index('IDX_WF_HISTORY_TO_STATE', ['toStateId'])
@Index('IDX_WF_HISTORY_FROM_STATE', ['fromStateId'])
@Index('IDX_WF_HISTORY_TIMESTAMP', ['actionTimestamp'])
@Index('IDX_WF_HISTORY_USER', ['actionUserId'])
@Index('IDX_WF_HISTORY_ACTION_TYPE', ['actionType'])
export class WorkflowHistory extends BaseEntity {
    // References
    @Column({ name: 'STORED_SERVICE_REQ_ID', type: 'varchar2', length: 36 })
    storedServiceReqId: string;

    @Column({ name: 'STORED_SERVICE_ID', type: 'varchar2', length: 36, nullable: true })
    storedServiceId?: string | null;

    // State Transition
    @Column({ name: 'FROM_STATE_ID', type: 'varchar2', length: 36, nullable: true })
    fromStateId?: string | null;

    @Column({ name: 'TO_STATE_ID', type: 'varchar2', length: 36 })
    toStateId: string;

    // Current State Info (chỉ có khi IS_CURRENT = 1)
    @Column({ name: 'PREVIOUS_STATE_ID', type: 'varchar2', length: 36, nullable: true })
    previousStateId?: string | null;

    // Timing Info
    @Column({ name: 'STARTED_AT', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    startedAt: Date;

    @Column({ name: 'ACTION_TIMESTAMP', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    actionTimestamp: Date;

    @Column({ name: 'CURR_STATE_START_AT', type: 'timestamp', nullable: true })
    currentStateStartedAt?: Date | null;

    @Column({ name: 'COMPLETED_AT', type: 'timestamp', nullable: true })
    completedAt?: Date | null;

    @Column({ name: 'EST_COMPLETION_TIME', type: 'timestamp', nullable: true })
    estimatedCompletionTime?: Date | null;

    @Column({ name: 'DURATION_MINUTES', type: 'number', nullable: true })
    durationMinutes?: number | null;

    // Action Info
    @Column({ name: 'ACTION_TYPE', type: 'varchar2', length: 50 })
    actionType: string; // 'START', 'COMPLETE', 'SKIP', 'ROLLBACK', 'PAUSE', 'RESUME'

    @Column({ name: 'ACTION_USER_ID', type: 'varchar2', length: 36 })
    actionUserId: string;

    @Column({ name: 'ACTION_USERNAME', type: 'varchar2', length: 50, nullable: true })
    actionUsername?: string | null;

    @Column({ name: 'ACTION_DEPT_ID', type: 'varchar2', length: 36, nullable: true })
    actionDepartmentId?: string | null;

    @Column({ name: 'ACTION_ROOM_ID', type: 'varchar2', length: 36, nullable: true })
    actionRoomId?: string | null;

    // Current Processing Info (chỉ có khi IS_CURRENT = 1)
    @Column({ name: 'CURR_USER_ID', type: 'varchar2', length: 36, nullable: true })
    currentUserId?: string | null;

    @Column({ name: 'CURR_DEPT_ID', type: 'varchar2', length: 36, nullable: true })
    currentDepartmentId?: string | null;

    @Column({ name: 'CURR_ROOM_ID', type: 'varchar2', length: 36, nullable: true })
    currentRoomId?: string | null;

    // Transition Info (ai đã chuyển workflow sang state hiện tại - chỉ khi IS_CURRENT = 1)
    @Column({ name: 'TRANS_BY_USER_ID', type: 'varchar2', length: 36, nullable: true })
    transitionedByUserId?: string | null;

    @Column({ name: 'TRANS_BY_DEPT_ID', type: 'varchar2', length: 36, nullable: true })
    transitionedByDepartmentId?: string | null;

    @Column({ name: 'TRANS_BY_ROOM_ID', type: 'varchar2', length: 36, nullable: true })
    transitionedByRoomId?: string | null;

    // Status
    @Column({ name: 'IS_CURRENT', type: 'number', default: 0 })
    isCurrent: number; // 1 = current state, 0 = history

    @Column({ name: 'IS_ACTIVE', type: 'number', default: 1 })
    isActive: number; // Workflow đang active (chỉ khi IS_CURRENT = 1)

    @Column({ name: 'IS_COMPLETED', type: 'number', default: 0 })
    isCompleted: number; // Workflow đã hoàn thành (chỉ khi IS_CURRENT = 1)

    @Column({ name: 'NOTES', type: 'varchar2', length: 1000, nullable: true })
    notes?: string | null;

    // Additional Info
    @Column({ name: 'ATTACHMENT_URL', type: 'varchar2', length: 500, nullable: true })
    attachmentUrl?: string | null;

    @Column({ name: 'METADATA', type: 'clob', nullable: true })
    metadata?: string | null;

    // Relationships
    @ManyToOne(() => WorkflowState)
    @JoinColumn({ name: 'FROM_STATE_ID' })
    fromState?: WorkflowState;

    @ManyToOne(() => WorkflowState)
    @JoinColumn({ name: 'TO_STATE_ID' })
    toState: WorkflowState;

    @ManyToOne(() => WorkflowState)
    @JoinColumn({ name: 'PREVIOUS_STATE_ID' })
    previousState?: WorkflowState;

    // Relationship với StoredServiceRequest (sử dụng string reference để tránh circular dependency)
    // Entity sẽ được join trong repository query builder
    @ManyToOne('StoredServiceRequest', 'id')
    @JoinColumn({ name: 'STORED_SERVICE_REQ_ID' })
    storedServiceRequest?: any;

    // Business methods
    isCurrentState(): boolean {
        return this.isCurrent === 1;
    }

    isHistoryRecord(): boolean {
        return this.isCurrent === 0;
    }

    isWorkflowActive(): boolean {
        return this.isActive === 1 && this.isCurrent === 1 && !this.deletedAt;
    }

    isWorkflowCompleted(): boolean {
        return this.isCompleted === 1 && this.isCurrent === 1;
    }
}

