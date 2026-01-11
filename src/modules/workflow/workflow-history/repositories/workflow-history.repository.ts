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
        stateId: string | undefined,
        roomType: 'actionRoomId' | 'currentRoomId' | 'transitionedByRoomId',
        stateType: 'toStateId' | 'fromStateId',
        timeType: 'actionTimestamp' | 'startedAt' | 'completedAt' | 'currentStateStartedAt' = 'actionTimestamp',
        fromDate?: Date,
        toDate?: Date,
        isCurrent?: number,
        hisServiceReqCode?: string,
        flag?: string,
        receptionCode?: string,
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

            // Chỉ filter theo room nếu roomId được cung cấp
            if (roomId) {
                queryBuilder.andWhere(`wh.${roomType} = :roomId`, { roomId });
            }

            // Filter theo hisServiceReqCode nếu được cung cấp và không phải chuỗi rỗng
            // Dùng WHERE EXISTS để tránh vấn đề với string reference entity
            if (hisServiceReqCode && hisServiceReqCode.trim() !== '') {
                queryBuilder.andWhere(
                    `EXISTS (
                        SELECT 1 FROM BML_STORED_SERVICE_REQUESTS ssr 
                        WHERE ssr.ID = wh.STORED_SERVICE_REQ_ID 
                        AND ssr.HIS_SERVICE_REQ_CODE = :hisServiceReqCode
                        AND ssr.DELETED_AT IS NULL
                    )`,
                    { hisServiceReqCode }
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

            // Filter theo receptionCode nếu được cung cấp
            // Dùng WHERE EXISTS để filter theo receptionCode của stored service request service
            if (receptionCode !== undefined) {
                if (receptionCode === null || receptionCode === '') {
                    // Nếu receptionCode = null hoặc rỗng, filter các request không có receptionCode
                    queryBuilder.andWhere(
                        `EXISTS (
                            SELECT 1 FROM BML_STORED_SR_SERVICES sss 
                            WHERE sss.STORED_SERVICE_REQ_ID = wh.STORED_SERVICE_REQ_ID 
                            AND sss.RECEPTION_CODE IS NULL
                            AND sss.DELETED_AT IS NULL
                        )`
                    );
                } else {
                    // Nếu receptionCode có giá trị, filter các request có receptionCode = giá trị đó
                    queryBuilder.andWhere(
                        `EXISTS (
                            SELECT 1 FROM BML_STORED_SR_SERVICES sss 
                            WHERE sss.STORED_SERVICE_REQ_ID = wh.STORED_SERVICE_REQ_ID 
                            AND sss.RECEPTION_CODE = :receptionCode
                            AND sss.DELETED_AT IS NULL
                        )`,
                        { receptionCode }
                    );
                }
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
