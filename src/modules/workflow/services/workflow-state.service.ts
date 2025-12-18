import { BadRequestException, ConflictException, Injectable, NotFoundException, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IWorkflowStateRepository } from '../interfaces/workflow-state.repository.interface';
import { CreateWorkflowStateDto } from '../dto/commands/create-workflow-state.dto';
import { UpdateWorkflowStateDto } from '../dto/commands/update-workflow-state.dto';
import { GetWorkflowStatesDto } from '../dto/queries/get-workflow-states.dto';
import { WorkflowState } from '../entities/workflow-state.entity';
import { WorkflowStateResponseDto, GetWorkflowStatesResult } from '../dto/responses/workflow-state-response.dto';
import { CurrentUser } from '../../../common/interfaces/current-user.interface';

@Injectable()
export class WorkflowStateService {
    constructor(
        @Inject('IWorkflowStateRepository')
        private readonly repo: IWorkflowStateRepository,
        private readonly dataSource: DataSource,
    ) { }

    // CREATE
    async create(dto: CreateWorkflowStateDto, currentUser: CurrentUser): Promise<string> {
        return this.dataSource.transaction(async (manager) => {
            // Check if stateCode already exists
            const exists = await this.repo.findByCode(dto.stateCode);
            if (exists) {
                throw new ConflictException(`Workflow state với mã ${dto.stateCode} đã tồn tại`);
            }

            // Check if stateOrder already exists
            const existingOrder = await this.repo.findAll({
                limit: 1,
                offset: 0,
            });
            // Note: Oracle doesn't support ILike, so we use UPPER() LIKE UPPER() pattern if needed
            // But for order check, we'll validate in service

            const entity = new WorkflowState();
            entity.stateCode = dto.stateCode.trim().toUpperCase();
            entity.stateName = dto.stateName.trim();
            entity.stateDescription = dto.stateDescription?.trim();
            entity.stateOrder = dto.stateOrder;
            entity.canSkip = dto.canSkip ?? 0;
            entity.requiresApproval = dto.requiresApproval ?? 0;
            entity.isActive = dto.isActive ?? 1;
            entity.createdBy = currentUser.id;
            entity.updatedBy = currentUser.id;

            const saved = await manager.save(WorkflowState, entity);
            return saved.id;
        });
    }

    // UPDATE
    async update(id: string, dto: UpdateWorkflowStateDto, currentUser: CurrentUser): Promise<void> {
        return this.dataSource.transaction(async (manager) => {
            const entity = await this.repo.findById(id);
            if (!entity) {
                throw new NotFoundException('Workflow state không tìm thấy');
            }

            // Check if stateCode is being changed and conflicts
            if (dto.stateCode && dto.stateCode !== entity.stateCode) {
                const exists = await this.repo.findByCode(dto.stateCode);
                if (exists && exists.id !== id) {
                    throw new ConflictException(`Workflow state với mã ${dto.stateCode} đã tồn tại`);
                }
                entity.stateCode = dto.stateCode.trim().toUpperCase();
            }

            if (dto.stateName !== undefined) {
                entity.stateName = dto.stateName.trim();
            }
            if (dto.stateDescription !== undefined) {
                entity.stateDescription = dto.stateDescription?.trim();
            }
            if (dto.stateOrder !== undefined) {
                entity.stateOrder = dto.stateOrder;
            }
            if (dto.canSkip !== undefined) {
                entity.canSkip = dto.canSkip;
            }
            if (dto.requiresApproval !== undefined) {
                entity.requiresApproval = dto.requiresApproval;
            }
            if (dto.isActive !== undefined) {
                entity.isActive = dto.isActive;
            }

            entity.updatedBy = currentUser.id;

            await manager.save(WorkflowState, entity);
        });
    }

    // DELETE
    async delete(id: string): Promise<void> {
        const entity = await this.repo.findById(id);
        if (!entity) {
            throw new NotFoundException('Workflow state không tìm thấy');
        }
        await this.repo.remove(id);
    }

    // GET ONE
    async getById(id: string): Promise<WorkflowStateResponseDto> {
        const entity = await this.repo.findById(id);
        if (!entity) {
            throw new NotFoundException('Workflow state không tìm thấy');
        }
        return this.mapToResponseDto(entity);
    }

    // GET BY CODE
    async getByCode(code: string): Promise<WorkflowStateResponseDto> {
        const entity = await this.repo.findByCode(code);
        if (!entity) {
            throw new NotFoundException(`Workflow state với mã ${code} không tìm thấy`);
        }
        return this.mapToResponseDto(entity);
    }

    // LIST
    async getAll(query: GetWorkflowStatesDto): Promise<GetWorkflowStatesResult> {
        const { items, total } = await this.repo.findAll(query);
        return {
            items: items.map(x => this.mapToResponseDto(x)),
            total,
            limit: query.limit ?? 10,
            offset: query.offset ?? 0,
        };
    }

    // GET FIRST STATE
    async getFirstState(): Promise<WorkflowStateResponseDto | null> {
        const entity = await this.repo.getFirstState();
        return entity ? this.mapToResponseDto(entity) : null;
    }

    // GET LAST STATE
    async getLastState(): Promise<WorkflowStateResponseDto | null> {
        const entity = await this.repo.getLastState();
        return entity ? this.mapToResponseDto(entity) : null;
    }

    // PRIVATE METHODS
    private mapToResponseDto(entity: WorkflowState): WorkflowStateResponseDto {
        return {
            id: entity.id,
            stateCode: entity.stateCode,
            stateName: entity.stateName,
            stateDescription: entity.stateDescription,
            stateOrder: entity.stateOrder,
            canSkip: entity.canSkip,
            requiresApproval: entity.requiresApproval,
            isActive: entity.isActive,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            deletedAt: entity.deletedAt,
            createdBy: entity.createdBy,
            updatedBy: entity.updatedBy,
            version: entity.version,
        };
    }
}

