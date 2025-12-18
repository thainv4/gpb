import { WorkflowState } from '../entities/workflow-state.entity';
import { GetWorkflowStatesDto } from '../dto/queries/get-workflow-states.dto';

export interface IWorkflowStateRepository {
    findById(id: string): Promise<WorkflowState | null>;
    findByCode(code: string): Promise<WorkflowState | null>;
    findAll(query: GetWorkflowStatesDto): Promise<{ items: WorkflowState[]; total: number }>;
    getFirstState(): Promise<WorkflowState | null>;
    getLastState(): Promise<WorkflowState | null>;
    save(entity: WorkflowState): Promise<WorkflowState>;
    remove(id: string): Promise<void>;
}

