import { BadRequestException, Injectable, NotFoundException, Inject } from '@nestjs/common';
import { DataSource, In, IsNull } from 'typeorm';
import { IWorkflowHistoryRepository } from '../interfaces/workflow-history.repository.interface';
import { IWorkflowStateRepository } from '../../interfaces/workflow-state.repository.interface';
import { IUserRepository } from '../../../user/interfaces/user.repository.interface';
import { StartWorkflowDto } from '../dto/commands/start-workflow.dto';
import { TransitionStateDto } from '../dto/commands/transition-state.dto';
import { UpdateCurrentStateDto } from '../dto/commands/update-current-state.dto';
import { GetWorkflowHistoryDto } from '../dto/queries/get-workflow-history.dto';
import { GetWorkflowHistoryByRoomStateDto } from '../dto/queries/get-workflow-history-by-room-state.dto';
import { WorkflowHistory } from '../entities/workflow-history.entity';
import { WorkflowHistoryResponseDto, GetWorkflowHistoryResult } from '../dto/responses/workflow-history-response.dto';
import { CurrentUser } from '../../../../common/interfaces/current-user.interface';
import { StoredServiceRequest } from '../../../service-request/entities/stored-service-request.entity';
import { StoredServiceRequestService } from '../../../service-request/entities/stored-service-request-service.entity';
import { WorkflowState } from '../../entities/workflow-state.entity';

@Injectable()
export class WorkflowHistoryService {
    constructor(
        @Inject('IWorkflowHistoryRepository')
        private readonly workflowHistoryRepo: IWorkflowHistoryRepository,
        @Inject('IWorkflowStateRepository')
        private readonly workflowStateRepo: IWorkflowStateRepository,
        @Inject('IUserRepository')
        private readonly userRepo: IUserRepository,
        private readonly dataSource: DataSource,
    ) { }

    // ========== COMMANDS (Write Operations) ==========

    /**
     * Bắt đầu workflow mới
     */
    async startWorkflow(dto: StartWorkflowDto, currentUser: CurrentUser): Promise<string> {
        return this.dataSource.transaction(async (manager) => {
            // ✅ QUAN TRỌNG: Set tất cả workflow history cũ có isCurrent = 1 thành isCurrent = 0
            // trước khi tạo workflow mới. Điều này cho phép restart workflow nếu cần.
            await this.workflowHistoryRepo.updateIsCurrent(
                dto.storedServiceReqId,
                dto.storedServiceId || null,
                0
            );

            // Validate state
            const toState = await this.workflowStateRepo.findById(dto.toStateId);
            if (!toState) {
                throw new NotFoundException('Workflow state không tồn tại');
            }

            // Lấy username
            const user = await this.userRepo.findById(currentUser.id);
            const username = user?.username || currentUser.username || '';

            // Tạo workflow history record mới
            const workflowHistory = new WorkflowHistory();
            workflowHistory.storedServiceReqId = dto.storedServiceReqId;
            workflowHistory.storedServiceId = dto.storedServiceId || null;
            workflowHistory.fromStateId = null; // START không có from state
            workflowHistory.toStateId = dto.toStateId;
            workflowHistory.previousStateId = null;
            workflowHistory.startedAt = new Date();
            workflowHistory.actionTimestamp = new Date();
            workflowHistory.currentStateStartedAt = new Date();
            workflowHistory.actionType = 'START';
            workflowHistory.actionUserId = currentUser.id;
            workflowHistory.actionUsername = username;
            workflowHistory.actionDepartmentId = currentUser.id; // Có thể lấy từ profile sau
            workflowHistory.actionRoomId = null;
            workflowHistory.currentUserId = dto.currentUserId || null;
            workflowHistory.currentDepartmentId = dto.currentDepartmentId || null;
            workflowHistory.currentRoomId = dto.currentRoomId || null;
            workflowHistory.transitionedByUserId = currentUser.id;
            workflowHistory.transitionedByDepartmentId = dto.currentDepartmentId || null;
            workflowHistory.transitionedByRoomId = dto.currentRoomId || null;
            workflowHistory.isCurrent = 1; // Current state
            workflowHistory.isActive = 1;
            workflowHistory.isCompleted = 0;
            workflowHistory.notes = dto.notes || null;
            workflowHistory.estimatedCompletionTime = dto.estimatedCompletionTime
                ? new Date(dto.estimatedCompletionTime)
                : null;
            workflowHistory.createdBy = currentUser.id;
            workflowHistory.updatedBy = currentUser.id;

            const saved = await manager.save(WorkflowHistory, workflowHistory);
            return saved.id;
        });
    }

    /**
     * Chuyển workflow sang state mới
     * Nếu không có currentState, sẽ tạo workflow mới (như START workflow)
     */
    async transitionState(dto: TransitionStateDto, currentUser: CurrentUser): Promise<string> {
        return this.dataSource.transaction(async (manager) => {
            // Tìm current state
            const currentState = await this.workflowHistoryRepo.findCurrentState(
                dto.storedServiceReqId,
                dto.storedServiceId || null
            );

            // ✅ Nếu không có currentState, cho phép tạo workflow history mới (như START workflow)
            if (!currentState) {
                // Validate new state
                const toState = await this.workflowStateRepo.findById(dto.toStateId);
                if (!toState) {
                    throw new NotFoundException('Workflow state đích không tồn tại');
                }

                // Lấy username
                const user = await this.userRepo.findById(currentUser.id);
                const username = user?.username || currentUser.username || '';

                // ✅ Set tất cả workflow history cũ có isCurrent = 1 thành isCurrent = 0
                // để đảm bảo chỉ có 1 workflow có isCurrent = 1
                await this.workflowHistoryRepo.updateIsCurrent(
                    dto.storedServiceReqId,
                    dto.storedServiceId || null,
                    0
                );

                // Tạo workflow history mới (tương tự START nhưng dùng actionType từ DTO)
                const newState = new WorkflowHistory();
                newState.storedServiceReqId = dto.storedServiceReqId;
                newState.storedServiceId = dto.storedServiceId || null;
                newState.fromStateId = null; // Không có from state (bắt đầu mới)
                newState.toStateId = dto.toStateId;
                newState.previousStateId = null;
                newState.startedAt = new Date();
                newState.actionTimestamp = new Date();
                newState.currentStateStartedAt = new Date();
                newState.durationMinutes = null;
                newState.actionType = dto.actionType; // Dùng actionType từ DTO
                newState.actionUserId = currentUser.id;
                newState.actionUsername = username;
                newState.actionDepartmentId = dto.currentDepartmentId || null;
                newState.actionRoomId = dto.currentRoomId || null;
                newState.currentUserId = dto.currentUserId || null;
                newState.currentDepartmentId = dto.currentDepartmentId || null;
                newState.currentRoomId = dto.currentRoomId || null;
                newState.transitionedByUserId = currentUser.id;
                newState.transitionedByDepartmentId = dto.currentDepartmentId || null;
                newState.transitionedByRoomId = dto.currentRoomId || null;
                newState.isCurrent = 1; // Current state
                newState.isActive = 1;
                newState.isCompleted = dto.toStateId === (await this.getCompletedStateId()) ? 1 : 0;
                newState.notes = dto.notes || null;
                newState.estimatedCompletionTime = dto.estimatedCompletionTime
                    ? new Date(dto.estimatedCompletionTime)
                    : null;
                newState.attachmentUrl = dto.attachmentUrl || null;
                newState.createdBy = currentUser.id;
                newState.updatedBy = currentUser.id;

                // Set completed_at nếu workflow đã hoàn thành
                if (newState.isCompleted === 1) {
                    newState.completedAt = new Date();
                }

                const saved = await manager.save(WorkflowHistory, newState);
                return saved.id;
            }

            // Validate new state (logic cũ khi có currentState)
            const toState = await this.workflowStateRepo.findById(dto.toStateId);
            if (!toState) {
                throw new NotFoundException('Workflow state đích không tồn tại');
            }

            // Lấy fromState từ currentState.toStateId
            const fromState = await this.workflowStateRepo.findById(currentState.toStateId);
            if (!fromState) {
                throw new NotFoundException('Workflow state nguồn không tồn tại');
            }

            // Kiểm tra stateOrder: không cho phép chuyển từ stateOrder cao về stateOrder thấp (trừ ROLLBACK)
            if (dto.actionType !== 'ROLLBACK' && fromState.stateOrder > toState.stateOrder) {
                throw new BadRequestException(
                    `Không thể chuyển từ trạng thái ${fromState.stateName} ` +
                    `sang trạng thái ${toState.stateName}.`
                );
            }

            // Kiểm tra không thể chuyển về state cũ trừ khi là ROLLBACK
            if (dto.actionType !== 'ROLLBACK' && dto.toStateId === currentState.toStateId) {
                throw new BadRequestException('Không thể chuyển sang trạng thái hiện tại');
            }

            // Tính duration từ state cũ
            const durationMinutes = currentState.currentStateStartedAt
                ? Math.round((Date.now() - currentState.currentStateStartedAt.getTime()) / (1000 * 60))
                : null;

            // Lấy username
            const user = await this.userRepo.findById(currentUser.id);
            const username = user?.username || currentUser.username || '';

            // 1. UPDATE record cũ: set IS_CURRENT = 0, update duration
            currentState.isCurrent = 0;
            currentState.durationMinutes = durationMinutes;
            currentState.updatedBy = currentUser.id;
            await manager.save(WorkflowHistory, currentState);

            // 2. Tạo record mới với IS_CURRENT = 1
            const newState = new WorkflowHistory();
            newState.storedServiceReqId = dto.storedServiceReqId;
            newState.storedServiceId = dto.storedServiceId || null;
            newState.fromStateId = currentState.toStateId; // Từ state cũ
            newState.toStateId = dto.toStateId; // Đến state mới
            newState.previousStateId = currentState.toStateId;
            newState.startedAt = currentState.startedAt; // Giữ nguyên started_at từ record đầu
            newState.actionTimestamp = new Date();
            newState.currentStateStartedAt = new Date();
            newState.durationMinutes = null; // Sẽ được tính khi chuyển state tiếp
            newState.actionType = dto.actionType;
            newState.actionUserId = currentUser.id;
            newState.actionUsername = username;
            newState.actionDepartmentId = dto.currentDepartmentId || null;
            newState.actionRoomId = dto.currentRoomId || null;
            newState.currentUserId = dto.currentUserId || null;
            newState.currentDepartmentId = dto.currentDepartmentId || null;
            newState.currentRoomId = dto.currentRoomId || null;
            newState.transitionedByUserId = currentUser.id;
            newState.transitionedByDepartmentId = dto.currentDepartmentId || null;
            newState.transitionedByRoomId = dto.currentRoomId || null;
            newState.isCurrent = 1; // Current state
            newState.isActive = 1;
            newState.isCompleted = dto.toStateId === (await this.getCompletedStateId()) ? 1 : 0; // Check nếu là state hoàn thành
            newState.notes = dto.notes || null;
            newState.estimatedCompletionTime = dto.estimatedCompletionTime
                ? new Date(dto.estimatedCompletionTime)
                : null;
            newState.attachmentUrl = dto.attachmentUrl || null;
            newState.createdBy = currentUser.id;
            newState.updatedBy = currentUser.id;

            // Set completed_at nếu workflow đã hoàn thành
            if (newState.isCompleted === 1) {
                newState.completedAt = new Date();
            }

            const saved = await manager.save(WorkflowHistory, newState);
            return saved.id;
        });
    }

    /**
     * Cập nhật thông tin current state (không chuyển state)
     */
    async updateCurrentState(
        storedServiceReqId: string,
        storedServiceId: string | null,
        dto: UpdateCurrentStateDto,
        currentUser: CurrentUser
    ): Promise<void> {
        return this.dataSource.transaction(async (manager) => {
            const currentState = await this.workflowHistoryRepo.findCurrentState(
                storedServiceReqId,
                storedServiceId
            );

            if (!currentState) {
                throw new NotFoundException('Không tìm thấy workflow đang chạy');
            }

            if (dto.currentUserId !== undefined) {
                currentState.currentUserId = dto.currentUserId || null;
            }
            if (dto.currentDepartmentId !== undefined) {
                currentState.currentDepartmentId = dto.currentDepartmentId || null;
            }
            if (dto.currentRoomId !== undefined) {
                currentState.currentRoomId = dto.currentRoomId || null;
            }
            if (dto.estimatedCompletionTime !== undefined) {
                currentState.estimatedCompletionTime = dto.estimatedCompletionTime
                    ? new Date(dto.estimatedCompletionTime)
                    : null;
            }
            if (dto.notes !== undefined) {
                currentState.notes = dto.notes || null;
            }

            currentState.updatedBy = currentUser.id;
            await manager.save(WorkflowHistory, currentState);
        });
    }

    /**
     * Xóa hoàn toàn Workflow History (hard delete)
     * Chỉ được xóa nếu:
     * 1. Tất cả documentId của StoredServiceRequestService (theo storedServiceReqId) là null
     * 2. Không có WorkflowHistory khác có cùng storedServiceReqId với stateOrder lớn hơn
     */
    async deleteWorkflowHistory(id: string, currentUser: CurrentUser): Promise<void> {
        return this.dataSource.transaction(async (manager) => {
            // Tìm workflow history
            const workflowHistory = await this.workflowHistoryRepo.findById(id);
            if (!workflowHistory) {
                throw new NotFoundException('Workflow history không tìm thấy');
            }

            // Lấy toState để lấy stateOrder
            const toState = await this.workflowStateRepo.findById(workflowHistory.toStateId);
            if (!toState) {
                throw new NotFoundException('Workflow state không tìm thấy');
            }
            const currentStateOrder = toState.stateOrder;

            // Kiểm tra xem có WorkflowHistory khác có cùng storedServiceReqId với stateOrder lớn hơn không
            const workflowHistoryRepo = manager.getRepository(WorkflowHistory);
            const otherWorkflowHistories = await workflowHistoryRepo.find({
                where: {
                    storedServiceReqId: workflowHistory.storedServiceReqId,
                    deletedAt: IsNull(),
                },
                relations: ['toState'],
            });

            // Lọc ra các WorkflowHistory khác (không phải cái đang xóa) và có stateOrder lớn hơn
            const historiesWithHigherOrder = otherWorkflowHistories.filter(wh => {
                if (wh.id === id) return false; // Bỏ qua chính nó
                if (!wh.toState) return false; // Bỏ qua nếu không có toState
                return wh.toState.stateOrder > currentStateOrder;
            });

            if (historiesWithHigherOrder.length > 0) {
                const stateNames = historiesWithHigherOrder
                    .map(wh => `${wh.toState?.stateName || 'Unknown'} (order: ${wh.toState?.stateOrder})`)
                    .join(', ');
                throw new BadRequestException(
                    `Không thể xóa workflow history vì bệnh phẩm đang ở giai đoạn ${stateNames}.`
                );
            }

            // Kiểm tra documentId của tất cả services theo storedServiceReqId
            const serviceRepo = manager.getRepository(StoredServiceRequestService);
            const services = await serviceRepo.find({
                where: {
                    storedServiceRequestId: workflowHistory.storedServiceReqId,
                    deletedAt: IsNull(),
                },
            });

            // Kiểm tra xem có service nào có documentId không null không
            const servicesWithDocument = services.filter(s => s.documentId !== null && s.documentId !== undefined);
            if (servicesWithDocument.length > 0) {
                const serviceCodes = servicesWithDocument.map(s => s.serviceCode || s.id).join(', ');
                throw new BadRequestException(
                    `Không thể xóa workflow history vì có ${servicesWithDocument.length} service(s) có documentId không null: ${serviceCodes}. ` +
                    `Chỉ được xóa khi tất cả documentId của Service Request là null.`
                );
            }

            // ✅ SET resultText = null cho tất cả services có resultText khác null
            const servicesWithResultText = services.filter(s => s.resultText !== null && s.resultText !== undefined && s.resultText.trim() !== '');
            if (servicesWithResultText.length > 0) {
                // Set resultText = null và updatedBy cho tất cả services
                for (const service of servicesWithResultText) {
                    service.resultText = null;
                    service.updatedBy = currentUser.id;
                }
                // Save tất cả services đã được update
                await serviceRepo.save(servicesWithResultText);
            }

            // ✅ Nếu stateOrder = 1, xóa các bản ghi liên quan trong Stored_service_requests và stored_sr_services
            if (currentStateOrder === 1) {
                const storedServiceReqRepo = manager.getRepository(StoredServiceRequest);
                const storedServiceReqServiceRepo = manager.getRepository(StoredServiceRequestService);

                // Xóa tất cả StoredServiceRequestService liên quan (hard delete)
                await storedServiceReqServiceRepo.delete({
                    storedServiceRequestId: workflowHistory.storedServiceReqId,
                });

                // Xóa StoredServiceRequest (hard delete)
                await storedServiceReqRepo.delete(workflowHistory.storedServiceReqId);
            }

            // ✅ Nếu workflow history đang xóa có isCurrent = 1, cần tìm workflow history khác để set isCurrent = 1
            if (workflowHistory.isCurrent === 1) {
                // Tìm workflow history khác có cùng storedServiceReqId và storedServiceId, chưa bị xóa
                const otherHistories = await workflowHistoryRepo.find({
                    where: {
                        storedServiceReqId: workflowHistory.storedServiceReqId,
                        storedServiceId: workflowHistory.storedServiceId ?? IsNull(),
                        deletedAt: IsNull(),
                    },
                    relations: ['toState'],
                    order: { actionTimestamp: 'DESC' },
                });

                // Lọc ra các history khác (không phải cái đang xóa)
                const otherHistoriesFiltered = otherHistories.filter(wh => wh.id !== id);
                
                if (otherHistoriesFiltered.length > 0) {
                    // Chọn workflow history có actionTimestamp gần nhất với workflow đang xóa
                    const candidateHistory = otherHistoriesFiltered[0];
                    
                    // Set isCurrent = 1 cho candidate history
                    candidateHistory.isCurrent = 1;
                    candidateHistory.currentStateStartedAt = new Date();
                    candidateHistory.updatedBy = currentUser.id;
                    await manager.save(WorkflowHistory, candidateHistory);
                }
            }

            // Xóa hoàn toàn (hard delete)
            await this.workflowHistoryRepo.hardDelete(id);
        });
    }

    /**
     * Xóa workflow history theo toStateId và storedServiceReqId
     */
    async deleteByStateAndRequest(
        toStateId: string,
        storedServiceReqId: string,
        currentUser: CurrentUser
    ): Promise<void> {
        // Tìm workflow history theo toStateId và storedServiceReqId
        const workflowHistory = await this.workflowHistoryRepo.findByStateIdAndStoredServiceReqId(
            toStateId,
            storedServiceReqId,
            'toStateId'
        );

        if (!workflowHistory) {
            throw new NotFoundException(
                `Không tìm thấy workflow history với toStateId: ${toStateId} và storedServiceReqId: ${storedServiceReqId}`
            );
        }

        // Gọi deleteWorkflowHistory với id tìm được
        await this.deleteWorkflowHistory(workflowHistory.id, currentUser);
    }

    // ========== QUERIES (Read Operations) ==========

    /**
     * Lấy current state của workflow
     */
    async getCurrentState(storedServiceReqId: string, storedServiceId?: string | null): Promise<WorkflowHistoryResponseDto> {
        const currentState = await this.workflowHistoryRepo.findCurrentState(storedServiceReqId, storedServiceId);
        if (!currentState) {
            throw new NotFoundException('Không tìm thấy workflow đang chạy');
        }
        return this.mapToResponseDto(currentState);
    }

    /**
     * Lấy lịch sử workflow
     */
    async getHistory(storedServiceReqId: string, storedServiceId?: string | null): Promise<WorkflowHistoryResponseDto[]> {
        const history = await this.workflowHistoryRepo.findHistory(storedServiceReqId, storedServiceId);
        return history.map(item => this.mapToResponseDto(item));
    }

    /**
     * Lấy tất cả current states của một Service Request
     */
    async getCurrentStatesByServiceReq(storedServiceReqId: string): Promise<WorkflowHistoryResponseDto[]> {
        const states = await this.workflowHistoryRepo.findCurrentStatesByServiceReq(storedServiceReqId);
        return states.map(item => this.mapToResponseDto(item));
    }

    /**
     * Lấy danh sách workflow history với filter
     */
    async getAll(query: GetWorkflowHistoryDto): Promise<GetWorkflowHistoryResult> {
        const { items, total } = await this.workflowHistoryRepo.findAll(query);
        return {
            items: items.map(item => this.mapToResponseDto(item)),
            total,
            limit: query.limit ?? 10,
            offset: query.offset ?? 0,
        };
    }

    /**
     * Lấy workflow history theo ID với thông tin creator (truy vấn từ bảng User)
     */
    async getById(id: string): Promise<WorkflowHistoryResponseDto> {
        const workflowHistory = await this.workflowHistoryRepo.findById(id);
        if (!workflowHistory) {
            throw new NotFoundException('Workflow history không tìm thấy');
        }

        // ✅ TRUY VẤN THÔNG TIN NGƯỜI TẠO TỪ BẢNG USER (BML_USERS)
        let creator = null;
        if (workflowHistory.createdBy) {
            try {
                // Truy vấn user từ bảng BML_USERS thông qua IUserRepository
                const user = await this.userRepo.findById(workflowHistory.createdBy);
                if (user) {
                    creator = {
                        id: user.id,
                        userName: user.username,  // Từ cột USERNAME trong bảng BML_USERS
                        fullName: user.fullName, // Từ cột FULL_NAME trong bảng BML_USERS
                    };
                }
            } catch (error) {
                // Log error nhưng không throw để API vẫn chạy được
                console.error('Error loading creator user from BML_USERS table:', error);
            }
        }

        const dto = this.mapToResponseDto(workflowHistory);
        dto.creator = creator; // Gán thông tin creator đã truy vấn từ bảng User
        
        return dto;
    }

    /**
     * Lấy workflow history theo State ID và StoredServiceReqId (response tương tự getById)
     */
    async getByStateIdAndStoredServiceReqId(
        stateId: string,
        storedServiceReqId: string,
        stateType: 'toStateId' | 'fromStateId' = 'toStateId'
    ): Promise<WorkflowHistoryResponseDto> {
        const workflowHistory = await this.workflowHistoryRepo.findByStateIdAndStoredServiceReqId(
            stateId,
            storedServiceReqId,
            stateType
        );
        
        if (!workflowHistory) {
            throw new NotFoundException(
                `Workflow history không tìm thấy với stateId: ${stateId} (${stateType}) và storedServiceReqId: ${storedServiceReqId}`
            );
        }

        // ✅ TRUY VẤN THÔNG TIN NGƯỜI TẠO TỪ BẢNG USER (BML_USERS)
        let creator = null;
        if (workflowHistory.createdBy) {
            try {
                // Truy vấn user từ bảng BML_USERS thông qua IUserRepository
                const user = await this.userRepo.findById(workflowHistory.createdBy);
                if (user) {
                    creator = {
                        id: user.id,
                        userName: user.username,  // Từ cột USERNAME trong bảng BML_USERS
                        fullName: user.fullName, // Từ cột FULL_NAME trong bảng BML_USERS
                    };
                }
            } catch (error) {
                // Log error nhưng không throw để API vẫn chạy được
                console.error('Error loading creator user from BML_USERS table:', error);
            }
        }

        const dto = this.mapToResponseDto(workflowHistory);
        dto.creator = creator; // Gán thông tin creator đã truy vấn từ bảng User
        
        return dto;
    }

    /**
     * Lấy danh sách workflow history theo Room ID và State ID
     */
    async getByRoomAndState(
        dto: GetWorkflowHistoryByRoomStateDto
    ): Promise<GetWorkflowHistoryResult> {
        // Parse dates
        const fromDate = dto.fromDate ? new Date(dto.fromDate) : undefined;
        const toDate = dto.toDate ? new Date(dto.toDate) : undefined;

        // Validate date range
        if (fromDate && toDate && fromDate > toDate) {
            throw new BadRequestException('From date không được lớn hơn To date');
        }

        // Normalize stateId: empty string hoặc undefined => undefined
        const normalizedStateId = dto.stateId && dto.stateId.trim() !== '' ? dto.stateId : undefined;

        // Normalize flag: undefined => undefined, empty string => undefined, "null" string => null
        let normalizedFlag: string | undefined | null = undefined;
        if (dto.flag !== undefined) {
            if (dto.flag === '' || dto.flag.toLowerCase() === 'null') {
                normalizedFlag = null; // Filter các request không có flag
            } else {
                normalizedFlag = dto.flag; // Filter các request có flag = giá trị này
            }
        }

        // Normalize code: undefined => undefined, empty string => undefined
        const normalizedCode = dto.code && dto.code.trim() !== '' ? dto.code.trim() : undefined;

        // Luôn áp dụng filterByMaxStateOrder: Filter theo stateOrder lớn nhất TRƯỚC, sau đó mới filter theo stateId
        
        // BƯỚC 1: Query từ repository KHÔNG có filter stateId (để filterByMaxStateOrder hoạt động đúng)
        const [allItems] = await this.workflowHistoryRepo.findByRoomAndState(
            dto.roomId,
            undefined, // Không filter theo stateId ở đây - để filterByMaxStateOrder hoạt động đúng
            dto.roomType || 'currentRoomId',
            dto.stateType || 'toStateId',
            dto.timeType || 'actionTimestamp',
            fromDate,
            toDate,
            dto.isCurrent,
            normalizedCode,
            normalizedFlag,
            10000, // Limit lớn để lấy tất cả (sẽ filter và paginate sau)
            0, // Offset = 0
            dto.order || 'DESC',
            dto.orderBy || 'actionTimestamp'
        );

        // BƯỚC 2: Filter theo stateOrder lớn nhất TRƯỚC
        const filteredByStateOrder = await this.filterByMaxStateOrder(allItems);

        // BƯỚC 3: Filter theo stateId trên kết quả đã được filterByMaxStateOrder
        let filteredItems = filteredByStateOrder;
        
        if (normalizedStateId) {
            filteredItems = filteredItems.filter(item => {
                if (dto.stateType === 'fromStateId') {
                    return item.fromStateId === normalizedStateId;
                } else {
                    return item.toStateId === normalizedStateId;
                }
            });
        }

        // BƯỚC 4: Áp dụng pagination sau khi đã filter
        const limit = dto.limit || 10;
        const offset = dto.offset || 0;
        const finalTotal = filteredItems.length;
        const items = filteredItems.slice(offset, offset + limit);

        // Load StoredServiceRequest batch để tránh N+1 queries
        try {
            if (items.length > 0) {
                const storedReqRepo = this.dataSource.getRepository(StoredServiceRequest);
                const storedReqIds = [...new Set(items.map(item => item.storedServiceReqId))];
                const storedReqs = await storedReqRepo.find({
                    where: { id: In(storedReqIds), deletedAt: IsNull() },
                });
                const storedReqMap = new Map(storedReqs.map(sr => [sr.id, sr]));
                
                // Attach StoredServiceRequest to each WorkflowHistory item
                items.forEach(item => {
                    item.storedServiceRequest = storedReqMap.get(item.storedServiceReqId);
                });
            }
        } catch (error) {
            // Log error nhưng không throw để API vẫn chạy được
            console.error('Error loading StoredServiceRequest:', error);
        }

        // Load StoredServiceRequestService batch để lấy receptionCode
        // Map key = workflow history item id để lấy receptionCode chính xác cho từng item
        const itemReceptionCodeMap = new Map<string, string | null>();
        try {
            if (items.length > 0) {
                const serviceRepo = this.dataSource.getRepository(StoredServiceRequestService);
                const storedReqIds = [...new Set(items.map(item => item.storedServiceReqId))];
                
                // Load tất cả services cho các storedServiceReqId
                const services = await serviceRepo.find({
                    where: { 
                        storedServiceRequestId: In(storedReqIds),
                        deletedAt: IsNull(),
                    },
                });

                // Tạo map services theo storedServiceRequestId
                const serviceMap = new Map<string, StoredServiceRequestService[]>();
                services.forEach(service => {
                    const key = service.storedServiceRequestId;
                    if (!serviceMap.has(key)) {
                        serviceMap.set(key, []);
                    }
                    serviceMap.get(key)!.push(service);
                });

                // Tạo map receptionCode cho mỗi workflow history item
                items.forEach(item => {
                    const servicesForReq = serviceMap.get(item.storedServiceReqId) || [];
                    let receptionCode: string | null = null;

                    if (item.storedServiceId) {
                        // Nếu có storedServiceId, tìm service tương ứng
                        const matchingService = servicesForReq.find(s => s.id === item.storedServiceId);
                        if (matchingService) {
                            receptionCode = matchingService.receptionCode || null;
                        }
                    } else {
                        // Nếu không có storedServiceId, lấy từ service đầu tiên
                        if (servicesForReq.length > 0) {
                            receptionCode = servicesForReq[0].receptionCode || null;
                        }
                    }

                    // Key = workflow history item id để map chính xác vào response
                    itemReceptionCodeMap.set(item.id, receptionCode);
                });
            }
        } catch (error) {
            // Log error nhưng không throw để API vẫn chạy được
            console.error('Error loading StoredServiceRequestService for receptionCode:', error);
        }

        // Load WorkflowState batch để tránh N+1 queries
        try {
            if (items.length > 0) {
                const stateRepo = this.dataSource.getRepository(WorkflowState);
                const stateIds = new Set<string>();
                items.forEach(item => {
                    if (item.toStateId) stateIds.add(item.toStateId);
                    if (item.fromStateId) stateIds.add(item.fromStateId);
                });
                
                if (stateIds.size > 0) {
                    const states = await stateRepo.find({
                        where: { id: In([...stateIds]), deletedAt: IsNull() },
                    });
                    const stateMap = new Map(states.map(s => [s.id, s]));
                    
                    // Attach States to each WorkflowHistory item
                    items.forEach(item => {
                        if (item.toStateId && stateMap.has(item.toStateId)) {
                            item.toState = stateMap.get(item.toStateId);
                        }
                        if (item.fromStateId && stateMap.has(item.fromStateId)) {
                            item.fromState = stateMap.get(item.fromStateId);
                        }
                    });
                }
            }
        } catch (error) {
            // Log error nhưng không throw để API vẫn chạy được
            console.error('Error loading WorkflowState:', error);
        }

        // ✅ LOAD CREATOR INFO TỪ BẢNG USER (BML_USERS) - BATCH LOADING
        const creatorMap = new Map<string, { id: string; userName: string; fullName: string }>();
        try {
            if (items.length > 0) {
                const creatorIds = items
                    .map(item => item.createdBy)
                    .filter((id): id is string => !!id);
                
                if (creatorIds.length > 0) {
                    const uniqueCreatorIds = [...new Set(creatorIds)];
                    const users = await this.userRepo.findByIds(uniqueCreatorIds);
                    
                    users.forEach(user => {
                        creatorMap.set(user.id, {
                            id: user.id,
                            userName: user.username,
                            fullName: user.fullName,
                        });
                    });
                }
            }
        } catch (error) {
            // Log error nhưng không throw để API vẫn chạy được
            console.error('Error loading creator users from BML_USERS table:', error);
        }

        // Map to DTOs với creator info và receptionCode
        const mappedItems = items.map(item => {
            const dto = this.mapToResponseDto(item);
            dto.creator = item.createdBy ? creatorMap.get(item.createdBy) || null : null;
            
            // Thêm receptionCode vào serviceRequest nếu có
            if (dto.serviceRequest) {
                const receptionCode = itemReceptionCodeMap.get(item.id);
                dto.serviceRequest.receptionCode = receptionCode !== undefined ? receptionCode : null;
            }
            
            return dto;
        });

        return {
            items: mappedItems,
            total: finalTotal, // Sử dụng total sau khi filter
            limit: dto.limit || 10,
            offset: dto.offset || 0,
        };
    }

    // ========== PRIVATE METHODS ==========

    /**
     * Filter workflow history items để chỉ giữ lại các items có stateOrder lớn nhất
     * trong các toStateId của StoredServiceRequest
     */
    private async filterByMaxStateOrder(items: WorkflowHistory[]): Promise<WorkflowHistory[]> {
        if (items.length === 0) {
            return items;
        }

        try {
            // Load WorkflowState để có stateOrder
            const stateRepo = this.dataSource.getRepository(WorkflowState);
            const stateIds = new Set<string>();
            items.forEach(item => {
                if (item.toStateId) stateIds.add(item.toStateId);
                if (item.fromStateId) stateIds.add(item.fromStateId);
            });

            if (stateIds.size === 0) {
                return items; // Không có state nào, trả về nguyên items
            }

            const states = await stateRepo.find({
                where: { id: In([...stateIds]), deletedAt: IsNull() },
            });
            const stateMap = new Map(states.map(s => [s.id, s]));

            // Attach States to each WorkflowHistory item
            items.forEach(item => {
                if (item.toStateId && stateMap.has(item.toStateId)) {
                    item.toState = stateMap.get(item.toStateId);
                }
                if (item.fromStateId && stateMap.has(item.fromStateId)) {
                    item.fromState = stateMap.get(item.fromStateId);
                }
            });

            // Nhóm các workflow history theo storedServiceReqId
            const workflowHistoryByReqId = new Map<string, WorkflowHistory[]>();
            items.forEach(item => {
                const reqId = item.storedServiceReqId;
                if (!workflowHistoryByReqId.has(reqId)) {
                    workflowHistoryByReqId.set(reqId, []);
                }
                const reqHistories = workflowHistoryByReqId.get(reqId);
                if (reqHistories) {
                    reqHistories.push(item);
                }
            });

            // Tìm stateOrder lớn nhất cho mỗi storedServiceReqId và filter
            const filtered: WorkflowHistory[] = [];
            workflowHistoryByReqId.forEach((histories) => {
                // Tìm stateOrder lớn nhất trong các toStateId
                let maxStateOrder = -1;
                histories.forEach(history => {
                    if (history.toStateId && stateMap.has(history.toStateId)) {
                        const state = stateMap.get(history.toStateId);
                        if (state && state.stateOrder > maxStateOrder) {
                            maxStateOrder = state.stateOrder;
                        }
                    }
                });

                // Chỉ giữ lại các workflow history có toStateId với stateOrder = maxStateOrder
                histories.forEach(history => {
                    const state = history.toStateId ? stateMap.get(history.toStateId) : undefined;
                    if (state?.stateOrder === maxStateOrder || maxStateOrder === -1) {
                        // maxStateOrder === -1: Nếu không có state nào có stateOrder, vẫn giữ lại (trường hợp edge case)
                        filtered.push(history);
                    }
                });
            });

            return filtered;
        } catch (error) {
            // Log error nhưng không throw để API vẫn chạy được
            console.error('Error filtering by max stateOrder:', error);
            return items; // Trả về nguyên items nếu có lỗi
        }
    }

    private async getCompletedStateId(): Promise<string | null> {
        const completedState = await this.workflowStateRepo.findByCode('COMPLETED');
        return completedState?.id || null;
    }

    private mapToResponseDto(entity: WorkflowHistory): WorkflowHistoryResponseDto {
        const dto: WorkflowHistoryResponseDto = {
            id: entity.id,
            storedServiceReqId: entity.storedServiceReqId,
            storedServiceId: entity.storedServiceId,
            fromStateId: entity.fromStateId,
            toStateId: entity.toStateId,
            previousStateId: entity.previousStateId,
            startedAt: entity.startedAt,
            actionTimestamp: entity.actionTimestamp,
            currentStateStartedAt: entity.currentStateStartedAt,
            completedAt: entity.completedAt,
            estimatedCompletionTime: entity.estimatedCompletionTime,
            durationMinutes: entity.durationMinutes,
            actionType: entity.actionType,
            actionUserId: entity.actionUserId,
            actionUsername: entity.actionUsername,
            actionDepartmentId: entity.actionDepartmentId,
            actionRoomId: entity.actionRoomId,
            currentUserId: entity.currentUserId,
            currentDepartmentId: entity.currentDepartmentId,
            currentRoomId: entity.currentRoomId,
            transitionedByUserId: entity.transitionedByUserId,
            transitionedByDepartmentId: entity.transitionedByDepartmentId,
            transitionedByRoomId: entity.transitionedByRoomId,
            isCurrent: entity.isCurrent,
            isActive: entity.isActive,
            isCompleted: entity.isCompleted,
            notes: entity.notes,
            attachmentUrl: entity.attachmentUrl,
            metadata: entity.metadata,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            deletedAt: entity.deletedAt,
            createdBy: entity.createdBy,
            updatedBy: entity.updatedBy,
            version: entity.version,
        };

        // Map Service Request info (nếu có)
        if (entity.storedServiceRequest && typeof entity.storedServiceRequest === 'object') {
            const sr = entity.storedServiceRequest;
            dto.serviceRequest = {
                id: sr.id || '',
                hisServiceReqCode: sr.hisServiceReqCode || '',
                serviceReqCode: sr.serviceReqCode || '',
                serviceReqSttCode: sr.serviceReqSttCode || undefined,
                serviceReqTypeCode: sr.serviceReqTypeCode || undefined,
                patientCode: sr.patientCode || undefined,
                patientName: sr.patientName || undefined,
                patientDob: sr.patientDob || undefined,
                patientGenderName: sr.patientGenderName || undefined,
                requestRoomCode: sr.requestRoomCode || undefined,
                requestRoomName: sr.requestRoomName || undefined,
                requestDepartmentCode: sr.requestDepartmentCode || undefined,
                requestDepartmentName: sr.requestDepartmentName || undefined,
                executeRoomCode: sr.executeRoomCode || undefined,
                executeRoomName: sr.executeRoomName || undefined,
                executeDepartmentCode: sr.executeDepartmentCode || undefined,
                executeDepartmentName: sr.executeDepartmentName || undefined,
                instructionTime: sr.instructionTime || undefined,
                instructionDate: sr.instructionDate || undefined,
                storedAt: sr.storedAt || undefined,
                icdCode: sr.icdCode || undefined,
                icdName: sr.icdName || undefined,
                treatmentCode: sr.treatmentCode || undefined,
                numOfBlock: sr.numOfBlock || undefined,
            };
        }

        // Map State info (nested)
        if (entity.toState) {
            dto.toState = {
                id: entity.toState.id,
                stateCode: entity.toState.stateCode,
                stateName: entity.toState.stateName,
                sortOrder: entity.toState.stateOrder,
            };
        }

        if (entity.fromState) {
            dto.fromState = {
                id: entity.fromState.id,
                stateCode: entity.fromState.stateCode,
                stateName: entity.fromState.stateName,
                sortOrder: entity.fromState.stateOrder,
            };
        }

        return dto;
    }
}
