import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { WorkflowState } from '../entities/workflow-state.entity';
import { IWorkflowStateRepository } from '../interfaces/workflow-state.repository.interface';
import { GetWorkflowStatesDto } from '../dto/queries/get-workflow-states.dto';

@Injectable()
export class WorkflowStateRepository implements IWorkflowStateRepository {
    constructor(
        @InjectRepository(WorkflowState)
        private readonly repo: Repository<WorkflowState>,
    ) { }

    async findById(id: string): Promise<WorkflowState | null> {
        return this.repo.findOne({
            where: { id, deletedAt: IsNull() },
        });
    }

    async findByCode(code: string): Promise<WorkflowState | null> {
        return this.repo.findOne({
            where: { stateCode: code, deletedAt: IsNull() },
        });
    }

    async findAll(query: GetWorkflowStatesDto): Promise<{ items: WorkflowState[]; total: number }> {
        const queryBuilder = this.repo
            .createQueryBuilder('state')
            .where('state.deletedAt IS NULL');

        // Search filter
        if (query.search) {
            queryBuilder.andWhere(
                '(UPPER(state.stateCode) LIKE UPPER(:search) OR UPPER(state.stateName) LIKE UPPER(:search))',
                { search: `%${query.search}%` }
            );
        }

        // IsActive filter
        if (query.isActive !== undefined) {
            queryBuilder.andWhere('state.isActive = :isActive', { isActive: query.isActive });
        }

        // Order by
        const orderBy = query.orderBy || 'stateOrder';
        const order = query.order || 'ASC';
        queryBuilder.orderBy(`state.${orderBy}`, order);

        // Pagination
        const limit = query.limit ?? 10;
        const offset = query.offset ?? 0;
        queryBuilder.take(limit).skip(offset);

        const [items, total] = await queryBuilder.getManyAndCount();
        return { items, total };
    }

    async getFirstState(): Promise<WorkflowState | null> {
        return this.repo.findOne({
            where: { deletedAt: IsNull(), isActive: 1 },
            order: { stateOrder: 'ASC' },
        });
    }

    async getLastState(): Promise<WorkflowState | null> {
        return this.repo.findOne({
            where: { deletedAt: IsNull(), isActive: 1 },
            order: { stateOrder: 'DESC' },
        });
    }

    async save(entity: WorkflowState): Promise<WorkflowState> {
        return this.repo.save(entity);
    }

    async remove(id: string): Promise<void> {
        await this.repo.softDelete(id);
    }
}

