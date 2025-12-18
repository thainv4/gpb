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

    async findByRoomAndState(
        roomId: string,
        stateId: string | undefined,
        roomType: 'actionRoomId' | 'currentRoomId' | 'transitionedByRoomId',
        stateType: 'toStateId' | 'fromStateId',
        timeType: 'actionTimestamp' | 'startedAt' | 'completedAt' | 'currentStateStartedAt' = 'actionTimestamp',
        fromDate?: Date,
        toDate?: Date,
        isCurrent?: number,
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
                .where(`wh.${roomType} = :roomId`, { roomId })
                .andWhere('wh.deletedAt IS NULL');

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
