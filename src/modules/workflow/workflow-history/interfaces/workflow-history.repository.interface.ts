import { WorkflowHistory } from '../entities/workflow-history.entity';
import { GetWorkflowHistoryDto } from '../dto/queries/get-workflow-history.dto';

export interface IWorkflowHistoryRepository {
    findById(id: string): Promise<WorkflowHistory | null>;
    findByStateIdAndStoredServiceReqId(stateId: string, storedServiceReqId: string, stateType?: 'toStateId' | 'fromStateId'): Promise<WorkflowHistory | null>;
    findCurrentState(storedServiceReqId: string, storedServiceId?: string | null): Promise<WorkflowHistory | null>;
    findHistory(storedServiceReqId: string, storedServiceId?: string | null): Promise<WorkflowHistory[]>;
    findAll(query: GetWorkflowHistoryDto): Promise<{ items: WorkflowHistory[]; total: number }>;
    findCurrentStatesByServiceReq(storedServiceReqId: string): Promise<WorkflowHistory[]>;
    findByRoomAndState(
        roomId: string | undefined,
        stateId: string | undefined,
        roomType: 'actionRoomId' | 'currentRoomId' | 'transitionedByRoomId',
        stateType: 'toStateId' | 'fromStateId',
        timeType?: 'actionTimestamp' | 'startedAt' | 'completedAt' | 'currentStateStartedAt',
        fromDate?: Date,
        toDate?: Date,
        isCurrent?: number,
        code?: string,
        flag?: string,
        limit?: number,
        offset?: number,
        order?: 'ASC' | 'DESC',
        orderBy?: 'actionTimestamp' | 'createdAt' | 'startedAt'
    ): Promise<[WorkflowHistory[], number]>;
    save(entity: WorkflowHistory): Promise<WorkflowHistory>;
    updateIsCurrent(storedServiceReqId: string, storedServiceId: string | null, isCurrent: number): Promise<void>;
    remove(id: string): Promise<void>;
    hardDelete(id: string): Promise<void>; // Hard delete (xóa hoàn toàn)
}
