import { WorkflowHistory } from '../entities/workflow-history.entity';
import { GetWorkflowHistoryDto } from '../dto/queries/get-workflow-history.dto';

export interface IWorkflowHistoryRepository {
    findById(id: string): Promise<WorkflowHistory | null>;
    findByStateIdAndStoredServiceReqId(stateId: string, storedServiceReqId: string, stateType?: 'toStateId' | 'fromStateId'): Promise<WorkflowHistory | null>;
    findCurrentState(storedServiceReqId: string, storedServiceId?: string | null): Promise<WorkflowHistory | null>;
    findHistory(storedServiceReqId: string, storedServiceId?: string | null): Promise<WorkflowHistory[]>;
    findAll(query: GetWorkflowHistoryDto): Promise<{ items: WorkflowHistory[]; total: number }>;
    findCurrentStatesByServiceReq(storedServiceReqId: string): Promise<WorkflowHistory[]>;
    findAllByStoredServiceReqId(storedServiceReqId: string): Promise<WorkflowHistory[]>;
    findByRoomAndState(
        roomId: string | undefined,
        roomIds: string[] | undefined,
        stateId: string | undefined,
        roomType: 'actionRoomId' | 'currentRoomId' | 'transitionedByRoomId',
        stateType: 'toStateId' | 'fromStateId',
        timeType?: 'actionTimestamp' | 'startedAt' | 'completedAt' | 'currentStateStartedAt',
        fromDate?: Date,
        toDate?: Date,
        isCurrent?: number,
        code?: string,
        flag?: string,
        patientName?: string,
        limit?: number,
        offset?: number,
        order?: 'ASC' | 'DESC',
        orderBy?: 'actionTimestamp' | 'createdAt' | 'startedAt'
    ): Promise<[WorkflowHistory[], number]>;

    /**
     * Danh sách workflow theo phòng/bộ lọc, sau khi chỉ giữ các dòng có TO_STATE.STATE_ORDER
     * đạt max trong từng STORED_SERVICE_REQ_ID (cùng logic filterByMaxStateOrder cũ), rồi phân trang trong SQL.
     */
    findByRoomAndStateWithMaxToStateOrderPaginated(
        roomId: string | undefined,
        roomIds: string[] | undefined,
        filterStateId: string | undefined,
        roomType: 'actionRoomId' | 'currentRoomId' | 'transitionedByRoomId',
        stateType: 'toStateId' | 'fromStateId',
        timeType: 'actionTimestamp' | 'startedAt' | 'completedAt' | 'currentStateStartedAt',
        fromDate: Date | undefined,
        toDate: Date | undefined,
        isCurrent: number | undefined,
        code: string | undefined,
        flag: string | null | undefined,
        patientName: string | undefined,
        limit: number,
        offset: number,
        order: 'ASC' | 'DESC',
        orderBy: 'actionTimestamp' | 'createdAt' | 'startedAt',
    ): Promise<{ items: WorkflowHistory[]; total: number }>;

    /**
     * Danh sách WH_ID (phẳng) phục vụ xuất báo cáo Excel, đã áp filter + max-to-state-order + order.
     * Trả tối đa maxRows.
     */
    findIdsForReportExport(
        roomId: string | undefined,
        roomIds: string[] | undefined,
        filterStateId: string | undefined,
        roomType: 'actionRoomId' | 'currentRoomId' | 'transitionedByRoomId',
        stateType: 'toStateId' | 'fromStateId',
        timeType: 'actionTimestamp' | 'startedAt' | 'completedAt' | 'currentStateStartedAt',
        fromDate: Date | undefined,
        toDate: Date | undefined,
        isCurrent: number | undefined,
        code: string | undefined,
        flag: string | null | undefined,
        patientName: string | undefined,
        maxRows: number,
        order: 'ASC' | 'DESC',
        orderBy: 'actionTimestamp' | 'createdAt' | 'startedAt',
    ): Promise<string[]>;

    save(entity: WorkflowHistory): Promise<WorkflowHistory>;
    updateIsCurrent(storedServiceReqId: string, storedServiceId: string | null, isCurrent: number): Promise<void>;
    remove(id: string): Promise<void>;
    hardDelete(id: string): Promise<void>; // Hard delete (xóa hoàn toàn)

    /** Phân bổ số ca (stored service request) theo state hiện tại (max STATE_ORDER trong các nhánh IS_CURRENT = 1). */
    getDashboardStateDistribution(filters: {
        fromCreatedAt?: Date;
        toCreatedAt?: Date;
        currentRoomId?: string;
        currentDepartmentId?: string;
    }): Promise<
        Array<{
            stateId: string;
            stateCode: string;
            stateName: string;
            stateOrder: number;
            count: number;
        }>
    >;
}
