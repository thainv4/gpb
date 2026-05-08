import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
import { WorkflowHistory } from '../entities/workflow-history.entity';
import { IWorkflowHistoryRepository } from '../interfaces/workflow-history.repository.interface';
import { GetWorkflowHistoryDto } from '../dto/queries/get-workflow-history.dto';

@Injectable()
export class WorkflowHistoryRepository implements IWorkflowHistoryRepository {
    constructor(
        @InjectRepository(WorkflowHistory)
        private readonly repo: Repository<WorkflowHistory>,
    ) { }

    async findById(id: string): Promise<WorkflowHistory | null> {
        return this.repo.findOne({
            where: { id, deletedAt: IsNull() },
            relations: ['fromState', 'toState', 'previousState'],
        });
    }

    async findByStateIdAndStoredServiceReqId(
        stateId: string,
        storedServiceReqId: string,
        stateType: 'toStateId' | 'fromStateId' = 'toStateId'
    ): Promise<WorkflowHistory | null> {
        const where: any = {
            storedServiceReqId,
            deletedAt: IsNull(),
        };

        if (stateType === 'toStateId') {
            where.toStateId = stateId;
        } else {
            where.fromStateId = stateId;
        }

        return this.repo.findOne({
            where,
            relations: ['fromState', 'toState', 'previousState'],
            order: { actionTimestamp: 'DESC', createdAt: 'DESC' },
        });
    }

    async findCurrentState(storedServiceReqId: string, storedServiceId?: string | null): Promise<WorkflowHistory | null> {
        const where: any = {
            storedServiceReqId,
            isCurrent: 1,
            deletedAt: IsNull(),
        };

        if (storedServiceId !== undefined) {
            if (storedServiceId === null) {
                where.storedServiceId = IsNull();
            } else {
                where.storedServiceId = storedServiceId;
            }
        }

        return this.repo.findOne({
            where,
            relations: ['fromState', 'toState', 'previousState'],
            order: { actionTimestamp: 'DESC' },
        });
    }

    async findHistory(storedServiceReqId: string, storedServiceId?: string | null): Promise<WorkflowHistory[]> {
        const where: any = {
            storedServiceReqId,
            isCurrent: 0,
            deletedAt: IsNull(),
        };

        if (storedServiceId !== undefined) {
            if (storedServiceId === null) {
                where.storedServiceId = IsNull();
            } else {
                where.storedServiceId = storedServiceId;
            }
        }

        return this.repo.find({
            where,
            relations: ['fromState', 'toState'],
            order: { actionTimestamp: 'DESC' },
        });
    }

    async findAll(query: GetWorkflowHistoryDto): Promise<{ items: WorkflowHistory[]; total: number }> {
        const queryBuilder = this.repo
            .createQueryBuilder('wf')
            .leftJoinAndSelect('wf.fromState', 'fromState')
            .leftJoinAndSelect('wf.toState', 'toState')
            .leftJoinAndSelect('wf.previousState', 'previousState')
            .where('wf.deletedAt IS NULL');

        // Filter by Service Request
        if (query.storedServiceReqId) {
            queryBuilder.andWhere('wf.storedServiceReqId = :storedServiceReqId', {
                storedServiceReqId: query.storedServiceReqId,
            });
        }

        // Filter by Service
        if (query.storedServiceId !== undefined) {
            if (query.storedServiceId === null) {
                queryBuilder.andWhere('wf.storedServiceId IS NULL');
            } else {
                queryBuilder.andWhere('wf.storedServiceId = :storedServiceId', {
                    storedServiceId: query.storedServiceId,
                });
            }
        }

        // Filter by IS_CURRENT
        if (query.isCurrent !== undefined) {
            queryBuilder.andWhere('wf.isCurrent = :isCurrent', { isCurrent: query.isCurrent });
        }

        // Filter by Action Type
        if (query.actionType) {
            queryBuilder.andWhere('wf.actionType = :actionType', { actionType: query.actionType });
        }

        // Filter by User
        if (query.actionUserId) {
            queryBuilder.andWhere('wf.actionUserId = :actionUserId', { actionUserId: query.actionUserId });
        }

        // Order by
        const orderBy = query.orderBy || 'actionTimestamp';
        const order = query.order || 'DESC';
        queryBuilder.orderBy(`wf.${orderBy}`, order);

        // Pagination
        const limit = query.limit ?? 10;
        const offset = query.offset ?? 0;
        queryBuilder.take(limit).skip(offset);

        const [items, total] = await queryBuilder.getManyAndCount();
        return { items, total };
    }

    async findCurrentStatesByServiceReq(storedServiceReqId: string): Promise<WorkflowHistory[]> {
        return this.repo.find({
            where: {
                storedServiceReqId,
                isCurrent: 1,
                deletedAt: IsNull(),
            },
            relations: ['fromState', 'toState', 'previousState'],
            order: { actionTimestamp: 'DESC' },
        });
    }

    async findAllByStoredServiceReqId(storedServiceReqId: string): Promise<WorkflowHistory[]> {
        return this.repo.find({
            where: {
                storedServiceReqId,
                deletedAt: IsNull(),
            },
            relations: ['toState'],
            order: { actionTimestamp: 'DESC' },
        });
    }

    async save(entity: WorkflowHistory): Promise<WorkflowHistory> {
        return this.repo.save(entity);
    }

    async updateIsCurrent(storedServiceReqId: string, storedServiceId: string | null, isCurrent: number): Promise<void> {
        const where: any = {
            storedServiceReqId,
            deletedAt: IsNull(),
        };

        if (storedServiceId === null) {
            where.storedServiceId = IsNull();
        } else {
            where.storedServiceId = storedServiceId;
        }

        await this.repo.update(where, { isCurrent });
    }

    async remove(id: string): Promise<void> {
        await this.repo.softDelete(id);
    }

    async hardDelete(id: string): Promise<void> {
        await this.repo.delete(id);
    }

    async findByRoomAndState(
        roomId: string | undefined,
        roomIds: string[] | undefined,
        stateId: string | undefined,
        roomType: 'actionRoomId' | 'currentRoomId' | 'transitionedByRoomId',
        stateType: 'toStateId' | 'fromStateId',
        timeType: 'actionTimestamp' | 'startedAt' | 'completedAt' | 'currentStateStartedAt' = 'actionTimestamp',
        fromDate?: Date,
        toDate?: Date,
        isCurrent?: number,
        code?: string,
        flag?: string,
        patientName?: string,
        limit: number = 10,
        offset: number = 0,
        order: 'ASC' | 'DESC' = 'DESC',
        orderBy: 'actionTimestamp' | 'createdAt' | 'startedAt' = 'actionTimestamp'
    ): Promise<[WorkflowHistory[], number]> {
        try {
            const queryBuilder = this.repo
                .createQueryBuilder('wh')
                // Tạm thời comment join State để test
                // .leftJoinAndSelect('wh.toState', 'toState')
                // .leftJoinAndSelect('wh.fromState', 'fromState')
                .where('wh.deletedAt IS NULL');

            // Filter theo room: roomId (một phòng) hoặc roomIds (danh sách phòng của user)
            if (roomId && roomId.trim() !== '') {
                queryBuilder.andWhere(`wh.${roomType} = :roomId`, { roomId });
            } else if (roomIds !== undefined) {
                if (roomIds.length > 0) {
                    queryBuilder.andWhere(`wh.${roomType} IN (:...roomIds)`, { roomIds });
                } else {
                    queryBuilder.andWhere('1 = 0'); // User không có phòng nào → không trả về bản ghi
                }
            }

            // Filter theo code nếu được cung cấp và không phải chuỗi rỗng
            // Tìm trong HIS_SERVICE_REQ_CODE, RECEPTION_CODE và PATIENT_CODE
            if (code && code.trim() !== '') {
                queryBuilder.andWhere(
                    `(
                        EXISTS (
                            SELECT 1 FROM BML_STORED_SERVICE_REQUESTS ssr 
                            WHERE ssr.ID = wh.STORED_SERVICE_REQ_ID 
                            AND ssr.HIS_SERVICE_REQ_CODE = :code
                            AND ssr.DELETED_AT IS NULL
                        )
                        OR EXISTS (
                            SELECT 1 FROM BML_STORED_SERVICE_REQUESTS ssr_pc
                            WHERE ssr_pc.ID = wh.STORED_SERVICE_REQ_ID
                            AND ssr_pc.PATIENT_CODE = :code
                            AND ssr_pc.DELETED_AT IS NULL
                        )
                        OR EXISTS (
                            SELECT 1 FROM BML_STORED_SR_SERVICES sss 
                            WHERE sss.STORED_SERVICE_REQ_ID = wh.STORED_SERVICE_REQ_ID 
                            AND sss.RECEPTION_CODE = :code
                            AND sss.DELETED_AT IS NULL
                        )
                    )`,
                    { code }
                );
            }

            // Filter theo flag nếu được cung cấp
            // Dùng WHERE EXISTS để filter theo flag của stored service request
            if (flag !== undefined) {
                if (flag === null) {
                    // Nếu flag = null, filter các request không có flag
                    queryBuilder.andWhere(
                        `EXISTS (
                            SELECT 1 FROM BML_STORED_SERVICE_REQUESTS ssr 
                            WHERE ssr.ID = wh.STORED_SERVICE_REQ_ID 
                            AND ssr.FLAG IS NULL
                            AND ssr.DELETED_AT IS NULL
                        )`
                    );
                } else {
                    // Nếu flag có giá trị, filter các request có flag = giá trị đó
                    queryBuilder.andWhere(
                        `EXISTS (
                            SELECT 1 FROM BML_STORED_SERVICE_REQUESTS ssr 
                            WHERE ssr.ID = wh.STORED_SERVICE_REQ_ID 
                            AND ssr.FLAG = :flag
                            AND ssr.DELETED_AT IS NULL
                        )`,
                        { flag }
                    );
                }
            }

            // Filter theo patientName nếu được cung cấp (partial match, case-insensitive)
            if (patientName && patientName.trim() !== '') {
                const patientNamePattern = `%${patientName.trim()}%`;
                queryBuilder.andWhere(
                    `EXISTS (
                        SELECT 1 FROM BML_STORED_SERVICE_REQUESTS ssr 
                        WHERE ssr.ID = wh.STORED_SERVICE_REQ_ID 
                        AND UPPER(ssr.PATIENT_NAME) LIKE UPPER(:patientNamePattern)
                        AND ssr.DELETED_AT IS NULL
                    )`,
                    { patientNamePattern }
                );
            }

            // Chỉ filter theo state nếu stateId được cung cấp
            if (stateId) {
                queryBuilder.andWhere(`wh.${stateType} = :stateId`, { stateId });
            }

            // Filter theo thời gian
            if (fromDate) {
                const timeColumn = this.getTimeColumnName(timeType);
                queryBuilder.andWhere(`wh.${timeColumn} >= :fromDate`, { fromDate });
            }

            if (toDate) {
                const timeColumn = this.getTimeColumnName(timeType);
                queryBuilder.andWhere(`wh.${timeColumn} <= :toDate`, { toDate });
            }

            // Filter isCurrent
            if (isCurrent !== undefined) {
                queryBuilder.andWhere('wh.isCurrent = :isCurrent', { isCurrent });
            }

            // Order by
            const orderColumn = this.getOrderColumnName(orderBy);
            queryBuilder.orderBy(`wh.${orderColumn}`, order);

            // Pagination
            queryBuilder.take(limit).skip(offset);

            return queryBuilder.getManyAndCount();
        } catch (error) {
            console.error('Error in findByRoomAndState:', error);
            throw error;
        }
    }

    async findByRoomAndStateWithMaxToStateOrderPaginated(
        roomId: string | undefined,
        roomIds: string[] | undefined,
        filterStateId: string | undefined,
        roomType: 'actionRoomId' | 'currentRoomId' | 'transitionedByRoomId',
        stateType: 'toStateId' | 'fromStateId',
        timeType: 'actionTimestamp' | 'startedAt' | 'completedAt' | 'currentStateStartedAt' = 'actionTimestamp',
        fromDate?: Date,
        toDate?: Date,
        isCurrent?: number,
        code?: string,
        flag?: string | null,
        patientName?: string,
        limit: number = 10,
        offset: number = 0,
        order: 'ASC' | 'DESC' = 'DESC',
        orderBy: 'actionTimestamp' | 'createdAt' | 'startedAt' = 'actionTimestamp',
    ): Promise<{ items: WorkflowHistory[]; total: number }> {
        const roomCol = this.mapRoomTypeToOracleColumn(roomType);
        const timeCol = this.getTimeColumnName(timeType);
        const orderCol = this.getOrderColumnNameForFilteredAlias(orderBy);

        const binds: Record<string, Date | string | number> = {};

        let roomCondition = '';
        if (roomId && roomId.trim() !== '') {
            roomCondition = `AND wh.${roomCol} = :p_room_id`;
            binds.p_room_id = roomId.trim();
        } else if (roomIds !== undefined) {
            if (roomIds.length === 0) {
                roomCondition = 'AND 1 = 0';
            } else {
                const placeholders = roomIds.map((_, i) => {
                    const key = `p_rid_${i}`;
                    binds[key] = roomIds[i];
                    return `:${key}`;
                });
                roomCondition = `AND wh.${roomCol} IN (${placeholders.join(', ')})`;
            }
        }

        let codeCondition = '';
        if (code && code.trim() !== '') {
            codeCondition = `AND (
                EXISTS (
                    SELECT 1 FROM BML_STORED_SERVICE_REQUESTS ssr
                    WHERE ssr.ID = wh.STORED_SERVICE_REQ_ID
                    AND ssr.HIS_SERVICE_REQ_CODE = :p_code
                    AND ssr.DELETED_AT IS NULL
                )
                OR EXISTS (
                    SELECT 1 FROM BML_STORED_SERVICE_REQUESTS ssr_pc
                    WHERE ssr_pc.ID = wh.STORED_SERVICE_REQ_ID
                    AND ssr_pc.PATIENT_CODE = :p_code
                    AND ssr_pc.DELETED_AT IS NULL
                )
                OR EXISTS (
                    SELECT 1 FROM BML_STORED_SR_SERVICES sss
                    WHERE sss.STORED_SERVICE_REQ_ID = wh.STORED_SERVICE_REQ_ID
                    AND sss.RECEPTION_CODE = :p_code
                    AND sss.DELETED_AT IS NULL
                )
            )`;
            binds.p_code = code.trim();
        }

        let flagCondition = '';
        if (flag !== undefined) {
            if (flag === null) {
                flagCondition = `AND EXISTS (
                    SELECT 1 FROM BML_STORED_SERVICE_REQUESTS ssr
                    WHERE ssr.ID = wh.STORED_SERVICE_REQ_ID
                    AND ssr.FLAG IS NULL
                    AND ssr.DELETED_AT IS NULL
                )`;
            } else {
                flagCondition = `AND EXISTS (
                    SELECT 1 FROM BML_STORED_SERVICE_REQUESTS ssr
                    WHERE ssr.ID = wh.STORED_SERVICE_REQ_ID
                    AND ssr.FLAG = :p_flag
                    AND ssr.DELETED_AT IS NULL
                )`;
                binds.p_flag = flag;
            }
        }

        let patientCondition = '';
        if (patientName && patientName.trim() !== '') {
            patientCondition = `AND EXISTS (
                SELECT 1 FROM BML_STORED_SERVICE_REQUESTS ssr
                WHERE ssr.ID = wh.STORED_SERVICE_REQ_ID
                AND UPPER(ssr.PATIENT_NAME) LIKE UPPER(:p_patient_pattern)
                AND ssr.DELETED_AT IS NULL
            )`;
            binds.p_patient_pattern = `%${patientName.trim()}%`;
        }

        let timeFromCondition = '';
        if (fromDate) {
            timeFromCondition = `AND wh.${timeCol} >= :p_from_date`;
            binds.p_from_date = fromDate;
        }

        let timeToCondition = '';
        if (toDate) {
            timeToCondition = `AND wh.${timeCol} <= :p_to_date`;
            binds.p_to_date = toDate;
        }

        let isCurrentCondition = '';
        if (isCurrent !== undefined) {
            isCurrentCondition = 'AND wh.IS_CURRENT = :p_is_current';
            binds.p_is_current = isCurrent;
        }

        let statePickCondition = '';
        if (filterStateId) {
            if (stateType === 'fromStateId') {
                statePickCondition = 'AND f.FROM_STATE_ID = :p_filter_state_id';
            } else {
                statePickCondition = 'AND f.TO_STATE_ID = :p_filter_state_id';
            }
            binds.p_filter_state_id = filterStateId;
        }

        const cteBody = `
WITH base AS (
    SELECT
        wh.ID AS WH_ID,
        wh.STORED_SERVICE_REQ_ID,
        st.STATE_ORDER AS TO_STATE_ORD,
        wh.ACTION_TIMESTAMP AS ACTION_TS,
        wh.CREATED_AT AS CRT_AT,
        wh.STARTED_AT AS ST_AT,
        wh.TO_STATE_ID,
        wh.FROM_STATE_ID
    FROM BML_WORKFLOW_HISTORY wh
    LEFT JOIN BML_WORKFLOW_STATES st ON st.ID = wh.TO_STATE_ID AND st.DELETED_AT IS NULL
    WHERE wh.DELETED_AT IS NULL
    ${roomCondition}
    ${codeCondition}
    ${flagCondition}
    ${patientCondition}
    ${timeFromCondition}
    ${timeToCondition}
    ${isCurrentCondition}
),
ranked AS (
    SELECT
        b.*,
        MAX(b.TO_STATE_ORD) OVER (PARTITION BY b.STORED_SERVICE_REQ_ID) AS MAX_TO_ORD
    FROM base b
),
filtered AS (
    SELECT
        r.WH_ID,
        r.ACTION_TS,
        r.CRT_AT,
        r.ST_AT,
        r.TO_STATE_ID,
        r.FROM_STATE_ID
    FROM ranked r
    WHERE r.MAX_TO_ORD IS NULL
        OR (r.TO_STATE_ORD IS NOT NULL AND r.TO_STATE_ORD = r.MAX_TO_ORD)
)`;

        const countSql = `${cteBody}
SELECT COUNT(1) AS CNT FROM filtered f
WHERE 1 = 1
${statePickCondition}`;

        const safeOrder = order === 'ASC' ? 'ASC' : 'DESC';

        const pageSql = `${cteBody}
SELECT f.WH_ID FROM filtered f
WHERE 1 = 1
${statePickCondition}
ORDER BY f.${orderCol} ${safeOrder} NULLS LAST
OFFSET :p_offset ROWS FETCH NEXT :p_limit ROWS ONLY`;

        try {
            const countRows = (await this.repo.manager.query(countSql, binds as any)) as Array<{ CNT: string | number }>;
            const total = Number(countRows[0]?.CNT ?? 0);

            if (total === 0) {
                return { items: [], total: 0 };
            }

            const pageBinds = {
                ...binds,
                p_offset: offset,
                p_limit: limit,
            };

            const idRows = (await this.repo.manager.query(pageSql, pageBinds as any)) as Array<{ WH_ID: string }>;
            const ids = idRows.map((r) => String(r.WH_ID)).filter(Boolean);

            if (ids.length === 0) {
                return { items: [], total };
            }

            const entities = await this.repo.find({
                where: { id: In(ids) },
            });

            const orderMap = new Map(ids.map((id, idx) => [id, idx]));
            entities.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));

            return { items: entities, total };
        } catch (error) {
            console.error('Error in findByRoomAndStateWithMaxToStateOrderPaginated:', error);
            throw error;
        }
    }

    /**
     * Lấy danh sách WH_ID phẳng cho báo cáo xuất Excel.
     * Dùng cùng CTE/window với `findByRoomAndStateWithMaxToStateOrderPaginated` nhưng:
     *  - Không có COUNT (không cần total nhờ size của mảng trả về)
     *  - Không có offset; chỉ có maxRows làm trần an toàn
     */
    async findIdsForReportExport(
        roomId: string | undefined,
        roomIds: string[] | undefined,
        filterStateId: string | undefined,
        roomType: 'actionRoomId' | 'currentRoomId' | 'transitionedByRoomId',
        stateType: 'toStateId' | 'fromStateId',
        timeType: 'actionTimestamp' | 'startedAt' | 'completedAt' | 'currentStateStartedAt' = 'actionTimestamp',
        fromDate?: Date,
        toDate?: Date,
        isCurrent?: number,
        code?: string,
        flag?: string | null,
        patientName?: string,
        maxRows: number = 200000,
        order: 'ASC' | 'DESC' = 'DESC',
        orderBy: 'actionTimestamp' | 'createdAt' | 'startedAt' = 'actionTimestamp',
    ): Promise<string[]> {
        const roomCol = this.mapRoomTypeToOracleColumn(roomType);
        const timeCol = this.getTimeColumnName(timeType);
        const orderCol = this.getOrderColumnNameForFilteredAlias(orderBy);

        const binds: Record<string, Date | string | number> = {};

        let roomCondition = '';
        if (roomId && roomId.trim() !== '') {
            roomCondition = `AND wh.${roomCol} = :p_room_id`;
            binds.p_room_id = roomId.trim();
        } else if (roomIds !== undefined) {
            if (roomIds.length === 0) {
                roomCondition = 'AND 1 = 0';
            } else {
                const placeholders = roomIds.map((_, i) => {
                    const key = `p_rid_${i}`;
                    binds[key] = roomIds[i];
                    return `:${key}`;
                });
                roomCondition = `AND wh.${roomCol} IN (${placeholders.join(', ')})`;
            }
        }

        let codeCondition = '';
        if (code && code.trim() !== '') {
            codeCondition = `AND (
                EXISTS (
                    SELECT 1 FROM BML_STORED_SERVICE_REQUESTS ssr
                    WHERE ssr.ID = wh.STORED_SERVICE_REQ_ID
                    AND ssr.HIS_SERVICE_REQ_CODE = :p_code
                    AND ssr.DELETED_AT IS NULL
                )
                OR EXISTS (
                    SELECT 1 FROM BML_STORED_SERVICE_REQUESTS ssr_pc
                    WHERE ssr_pc.ID = wh.STORED_SERVICE_REQ_ID
                    AND ssr_pc.PATIENT_CODE = :p_code
                    AND ssr_pc.DELETED_AT IS NULL
                )
                OR EXISTS (
                    SELECT 1 FROM BML_STORED_SR_SERVICES sss
                    WHERE sss.STORED_SERVICE_REQ_ID = wh.STORED_SERVICE_REQ_ID
                    AND sss.RECEPTION_CODE = :p_code
                    AND sss.DELETED_AT IS NULL
                )
            )`;
            binds.p_code = code.trim();
        }

        let flagCondition = '';
        if (flag !== undefined) {
            if (flag === null) {
                flagCondition = `AND EXISTS (
                    SELECT 1 FROM BML_STORED_SERVICE_REQUESTS ssr
                    WHERE ssr.ID = wh.STORED_SERVICE_REQ_ID
                    AND ssr.FLAG IS NULL
                    AND ssr.DELETED_AT IS NULL
                )`;
            } else {
                flagCondition = `AND EXISTS (
                    SELECT 1 FROM BML_STORED_SERVICE_REQUESTS ssr
                    WHERE ssr.ID = wh.STORED_SERVICE_REQ_ID
                    AND ssr.FLAG = :p_flag
                    AND ssr.DELETED_AT IS NULL
                )`;
                binds.p_flag = flag;
            }
        }

        let patientCondition = '';
        if (patientName && patientName.trim() !== '') {
            patientCondition = `AND EXISTS (
                SELECT 1 FROM BML_STORED_SERVICE_REQUESTS ssr
                WHERE ssr.ID = wh.STORED_SERVICE_REQ_ID
                AND UPPER(ssr.PATIENT_NAME) LIKE UPPER(:p_patient_pattern)
                AND ssr.DELETED_AT IS NULL
            )`;
            binds.p_patient_pattern = `%${patientName.trim()}%`;
        }

        let timeFromCondition = '';
        if (fromDate) {
            timeFromCondition = `AND wh.${timeCol} >= :p_from_date`;
            binds.p_from_date = fromDate;
        }

        let timeToCondition = '';
        if (toDate) {
            timeToCondition = `AND wh.${timeCol} <= :p_to_date`;
            binds.p_to_date = toDate;
        }

        let isCurrentCondition = '';
        if (isCurrent !== undefined) {
            isCurrentCondition = 'AND wh.IS_CURRENT = :p_is_current';
            binds.p_is_current = isCurrent;
        }

        let statePickCondition = '';
        if (filterStateId) {
            if (stateType === 'fromStateId') {
                statePickCondition = 'AND f.FROM_STATE_ID = :p_filter_state_id';
            } else {
                statePickCondition = 'AND f.TO_STATE_ID = :p_filter_state_id';
            }
            binds.p_filter_state_id = filterStateId;
        }

        const cteBody = `
WITH base AS (
    SELECT
        wh.ID AS WH_ID,
        wh.STORED_SERVICE_REQ_ID,
        st.STATE_ORDER AS TO_STATE_ORD,
        wh.ACTION_TIMESTAMP AS ACTION_TS,
        wh.CREATED_AT AS CRT_AT,
        wh.STARTED_AT AS ST_AT,
        wh.TO_STATE_ID,
        wh.FROM_STATE_ID
    FROM BML_WORKFLOW_HISTORY wh
    LEFT JOIN BML_WORKFLOW_STATES st ON st.ID = wh.TO_STATE_ID AND st.DELETED_AT IS NULL
    WHERE wh.DELETED_AT IS NULL
    ${roomCondition}
    ${codeCondition}
    ${flagCondition}
    ${patientCondition}
    ${timeFromCondition}
    ${timeToCondition}
    ${isCurrentCondition}
),
ranked AS (
    SELECT
        b.*,
        MAX(b.TO_STATE_ORD) OVER (PARTITION BY b.STORED_SERVICE_REQ_ID) AS MAX_TO_ORD
    FROM base b
),
filtered AS (
    SELECT
        r.WH_ID,
        r.ACTION_TS,
        r.CRT_AT,
        r.ST_AT,
        r.TO_STATE_ID,
        r.FROM_STATE_ID
    FROM ranked r
    WHERE r.MAX_TO_ORD IS NULL
        OR (r.TO_STATE_ORD IS NOT NULL AND r.TO_STATE_ORD = r.MAX_TO_ORD)
)`;

        const safeOrder = order === 'ASC' ? 'ASC' : 'DESC';

        const sql = `${cteBody}
SELECT f.WH_ID FROM filtered f
WHERE 1 = 1
${statePickCondition}
ORDER BY f.${orderCol} ${safeOrder} NULLS LAST
FETCH NEXT :p_max_rows ROWS ONLY`;

        try {
            const rows = (await this.repo.manager.query(sql, {
                ...binds,
                p_max_rows: maxRows,
            } as any)) as Array<{ WH_ID: string }>;
            return rows.map((r) => String(r.WH_ID)).filter(Boolean);
        } catch (error) {
            console.error('Error in findIdsForReportExport:', error);
            throw error;
        }
    }

    private mapRoomTypeToOracleColumn(
        roomType: 'actionRoomId' | 'currentRoomId' | 'transitionedByRoomId',
    ): string {
        const mapping: Record<string, string> = {
            actionRoomId: 'ACTION_ROOM_ID',
            currentRoomId: 'CURR_ROOM_ID',
            transitionedByRoomId: 'TRANS_BY_ROOM_ID',
        };
        return mapping[roomType] || 'CURR_ROOM_ID';
    }

    private getOrderColumnNameForFilteredAlias(
        orderBy: 'actionTimestamp' | 'createdAt' | 'startedAt',
    ): string {
        const mapping: Record<string, string> = {
            actionTimestamp: 'ACTION_TS',
            createdAt: 'CRT_AT',
            startedAt: 'ST_AT',
        };
        return mapping[orderBy] || 'ACTION_TS';
    }

    async getDashboardStateDistribution(filters: {
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
    > {
        const binds: Record<string, Date | string> = {};
        let dateConditions = '';
        if (filters.fromCreatedAt) {
            dateConditions += ' AND sr.CREATED_AT >= :fromCreatedAt';
            binds.fromCreatedAt = filters.fromCreatedAt;
        }
        if (filters.toCreatedAt) {
            dateConditions += ' AND sr.CREATED_AT <= :toCreatedAt';
            binds.toCreatedAt = filters.toCreatedAt;
        }
        if (filters.currentRoomId) {
            dateConditions += ' AND sr.CURRENT_ROOM_ID = :currentRoomId';
            binds.currentRoomId = filters.currentRoomId;
        }
        if (filters.currentDepartmentId) {
            dateConditions += ' AND sr.CURRENT_DEPARTMENT_ID = :currentDepartmentId';
            binds.currentDepartmentId = filters.currentDepartmentId;
        }

        const sql = `
            WITH ranked AS (
                SELECT
                    wh.STORED_SERVICE_REQ_ID AS stored_service_req_id,
                    wh.TO_STATE_ID AS to_state_id,
                    ROW_NUMBER() OVER (
                        PARTITION BY wh.STORED_SERVICE_REQ_ID
                        ORDER BY st.STATE_ORDER DESC, wh.ACTION_TIMESTAMP DESC
                    ) AS rn
                FROM BML_WORKFLOW_HISTORY wh
                INNER JOIN BML_WORKFLOW_STATES st ON st.ID = wh.TO_STATE_ID AND st.DELETED_AT IS NULL
                INNER JOIN BML_STORED_SERVICE_REQUESTS sr ON sr.ID = wh.STORED_SERVICE_REQ_ID AND sr.DELETED_AT IS NULL
                WHERE wh.IS_CURRENT = 1 AND wh.DELETED_AT IS NULL
                ${dateConditions}
            )
            SELECT
                ws.ID AS STATE_ID,
                ws.STATE_CODE AS STATE_CODE,
                ws.STATE_NAME AS STATE_NAME,
                ws.STATE_ORDER AS STATE_ORDER,
                COUNT(*) AS CNT
            FROM ranked r
            INNER JOIN BML_WORKFLOW_STATES ws ON ws.ID = r.to_state_id AND ws.DELETED_AT IS NULL
            WHERE r.rn = 1
            GROUP BY ws.ID, ws.STATE_CODE, ws.STATE_NAME, ws.STATE_ORDER
            ORDER BY ws.STATE_ORDER ASC
        `;

        // Oracle oracledb.execute nhận bind object; EntityManager.query typings là any[].
        const rows = (await this.repo.manager.query(sql, binds as any)) as Record<string, unknown>[];

        return rows.map((row) => ({
            stateId: String(row.STATE_ID),
            stateCode: String(row.STATE_CODE),
            stateName: String(row.STATE_NAME),
            stateOrder: Number(row.STATE_ORDER),
            count: Number(row.CNT),
        }));
    }

    private getTimeColumnName(timeType: string): string {
        const mapping: { [key: string]: string } = {
            'actionTimestamp': 'ACTION_TIMESTAMP',
            'startedAt': 'STARTED_AT',
            'completedAt': 'COMPLETED_AT',
            'currentStateStartedAt': 'CURR_STATE_START_AT',
        };
        return mapping[timeType] || 'ACTION_TIMESTAMP';
    }

    private getOrderColumnName(orderBy: string): string {
        const mapping: { [key: string]: string } = {
            'actionTimestamp': 'ACTION_TIMESTAMP',
            'createdAt': 'CREATED_AT',
            'startedAt': 'STARTED_AT',
        };
        return mapping[orderBy] || 'ACTION_TIMESTAMP';
    }
}
