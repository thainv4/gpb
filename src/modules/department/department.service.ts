import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IDepartmentRepository } from './interfaces/department.repository.interface';
import { CreateDepartmentDto } from './dto/commands/create-department.dto';
import { UpdateDepartmentDto } from './dto/commands/update-department.dto';
import { Department } from './entities/department.entity';
import { AppError } from '../../common/errors/app.error';
import { BaseService } from '../../common/services/base.service';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { GetDepartmentsDto, GetDepartmentsResult } from './dto/queries/get-departments.dto';
import { DepartmentResponseDto } from './dto/responses/department-response.dto';
import { SearchDepartmentsDto } from './dto/queries/search-departments.dto';
import { CurrentUser } from '../../common/interfaces/current-user.interface';
import { DataLoaderService } from '../../shared/dataloaders/dataloader.service';

@Injectable()
export class DepartmentService extends BaseService {
    constructor(
        @Inject('IDepartmentRepository')
        private readonly departmentRepository: IDepartmentRepository,
        @Inject(DataSource)
        protected readonly dataSource: DataSource,
        @Inject(CurrentUserContextService)
        protected readonly currentUserContext: CurrentUserContextService,
        private readonly dataLoaderService: DataLoaderService,
    ) {
        super(dataSource, currentUserContext);
    }

    // ========== COMMANDS (Write Operations) ==========

    async createDepartment(createDto: CreateDepartmentDto, currentUser: CurrentUser): Promise<string> {
        // Set current user context for automatic audit
        this.currentUserContext.setCurrentUser(currentUser);
        
        return this.transactionWithAudit(async (manager) => {
            // Check if department code already exists
            const existingByCode = await this.departmentRepository.existsByCode(createDto.departmentCode);
            if (existingByCode) {
                throw AppError.conflict('Department with this code already exists');
            }

            // Check if department name already exists
            const existingByName = await this.departmentRepository.existsByName(createDto.departmentName);
            if (existingByName) {
                throw AppError.conflict('Department with this name already exists');
            }

            // Check if short name already exists (if provided)
            if (createDto.shortName) {
                const existingByShortName = await this.departmentRepository.existsByShortName(createDto.shortName);
                if (existingByShortName) {
                    throw AppError.conflict('Department with this short name already exists');
                }
            }

            // Check circular reference if parent is provided
            if (createDto.parentDepartmentId) {
                const isCircular = await this.departmentRepository.isCircularReference('', createDto.parentDepartmentId);
                if (isCircular) {
                    throw AppError.conflict('Circular reference detected in department hierarchy');
                }
            }

            const department = new Department();
            department.departmentCode = createDto.departmentCode;
            department.departmentName = createDto.departmentName;
            department.branchId = createDto.branchId;
            department.headOfDepartment = createDto.headOfDepartment;
            department.headNurse = createDto.headNurse;
            department.parentDepartmentId = createDto.parentDepartmentId;
            department.shortName = createDto.shortName;
            department.departmentTypeId = createDto.departmentTypeId;
            department.sortOrder = createDto.sortOrder ?? await this.departmentRepository.getNextSortOrder();

            department.createdBy = currentUser.id;
            department.updatedBy = currentUser.id;

            const savedDepartment = await manager.save(Department, department);
            return savedDepartment.id;
        });
    }

    async updateDepartment(id: string, updateDto: UpdateDepartmentDto, currentUser: CurrentUser): Promise<void> {
        // Set current user context for automatic audit
        this.currentUserContext.setCurrentUser(currentUser);
        
        return this.transactionWithAudit(async (manager) => {
            const department = await this.departmentRepository.findById(id);
            if (!department) {
                throw AppError.notFound('Department not found');
            }

            // Check if department code already exists (if changed)
            if (updateDto.departmentCode && updateDto.departmentCode !== department.departmentCode) {
                const exists = await this.departmentRepository.existsByCode(updateDto.departmentCode, id);
                if (exists) {
                    throw AppError.conflict('Department with this code already exists');
                }
            }

            // Check if department name already exists (if changed)
            if (updateDto.departmentName && updateDto.departmentName !== department.departmentName) {
                const exists = await this.departmentRepository.existsByName(updateDto.departmentName, id);
                if (exists) {
                    throw AppError.conflict('Department with this name already exists');
                }
            }

            // Check if short name already exists (if changed)
            if (updateDto.shortName && updateDto.shortName !== department.shortName) {
                const exists = await this.departmentRepository.existsByShortName(updateDto.shortName, id);
                if (exists) {
                    throw AppError.conflict('Department with this short name already exists');
                }
            }

            // Check circular reference if parent is changed
            if (updateDto.parentDepartmentId !== undefined && updateDto.parentDepartmentId !== department.parentDepartmentId) {
                if (updateDto.parentDepartmentId) {
                    const isCircular = await this.departmentRepository.isCircularReference(id, updateDto.parentDepartmentId);
                    if (isCircular) {
                        throw AppError.conflict('Circular reference detected in department hierarchy');
                    }
                }
            }

            Object.assign(department, updateDto);
            department.updatedBy = currentUser.id;

            await manager.save(Department, department);
        });
    }

    async deleteDepartment(id: string, hardDelete: boolean = false): Promise<void> {
        const department = await this.departmentRepository.findById(id);
        if (!department) {
            throw AppError.notFound('Department not found');
        }

        // Check if department has children
        const children = await this.departmentRepository.findChildrenByParentId(id);
        if (children.length > 0) {
            throw AppError.conflict('Cannot delete department with children. Please delete children first.');
        }

        if (hardDelete) {
            await this.departmentRepository.delete(id);
        } else {
            await this.departmentRepository.softDelete(id);
        }
    }

    // ========== QUERIES (Read Operations) ==========

    async getDepartmentById(id: string): Promise<DepartmentResponseDto> {
        const department = await this.departmentRepository.findById(id);
        if (!department) {
            throw AppError.notFound('Department not found');
        }
        return this.mapToResponseDto(department);
    }

    async getDepartments(query: GetDepartmentsDto): Promise<GetDepartmentsResult> {
        const { limit = 10, offset = 0, search, isActive, branchId, departmentTypeId, parentDepartmentId, sortBy = 'sortOrder', sortOrder = 'ASC' } = query;

        const [departments, total] = await this.departmentRepository.findWithPagination(
            limit,
            offset,
            sortBy,
            sortOrder,
            { isActive, branchId, departmentTypeId, parentDepartmentId, search }
        );

        return {
            departments: departments.map(dept => this.mapToResponseDto(dept)),
            total,
            limit,
            offset,
        };
    }

    async searchDepartments(query: SearchDepartmentsDto): Promise<GetDepartmentsResult> {
        const { keyword, limit = 10, offset = 0, isActive, branchId, departmentTypeId, parentDepartmentId, sortBy = 'sortOrder', sortOrder = 'ASC' } = query;

        const [departments, total] = await this.departmentRepository.findWithPagination(
            limit,
            offset,
            sortBy,
            sortOrder,
            { isActive, branchId, departmentTypeId, parentDepartmentId, search: keyword }
        );

        return {
            departments: departments.map(dept => this.mapToResponseDto(dept)),
            total,
            limit,
            offset,
        };
    }

    async getDepartmentsByBranch(branchId: string): Promise<DepartmentResponseDto[]> {
        const departments = await this.departmentRepository.findByBranchId(branchId);
        return departments.map(dept => this.mapToResponseDto(dept));
    }

    async getDepartmentsByType(departmentTypeId: string): Promise<DepartmentResponseDto[]> {
        const departments = await this.departmentRepository.findByDepartmentTypeId(departmentTypeId);
        return departments.map(dept => this.mapToResponseDto(dept));
    }

    async getDepartmentHierarchy(): Promise<DepartmentResponseDto[]> {
        const rootDepartments = await this.departmentRepository.findRootDepartments();
        return rootDepartments.map(dept => this.mapToResponseDto(dept));
    }

    async getDepartmentChildren(parentId: string): Promise<DepartmentResponseDto[]> {
        const children = await this.departmentRepository.findChildrenByParentId(parentId);
        return children.map(dept => this.mapToResponseDto(dept));
    }

    // ========== DATALOADER INTEGRATION ==========

    async getDepartmentsWithStats(query: GetDepartmentsDto): Promise<GetDepartmentsResult> {
        const { limit = 10, offset = 0 } = query;

        const [departments, total] = await this.departmentRepository.findWithPagination(
            limit,
            offset,
            'sortOrder',
            'ASC',
            { isActive: true }
        );

        const loaders = this.dataLoaderService.createLoaders();

        const departmentsWithStats = await Promise.all(
            departments.map(async (department) => {
                // Example: Load related data using DataLoader (if needed)
                // const relatedData = await loaders.someRelatedDataLoader.load(department.id);

                return {
                    ...this.mapToResponseDto(department),
                    // Add related data here
                };
            })
        );

        return {
            departments: departmentsWithStats,
            total,
            limit,
            offset,
        };
    }

    // ========== STATISTICS ==========

    async getStatsOverview(): Promise<any> {
        const total = await this.departmentRepository.countTotal();
        const active = await this.departmentRepository.countActive();

        return {
            total,
            active,
            inactive: total - active,
        };
    }

    async getStatsByBranch(branchId: string): Promise<any> {
        const total = await this.departmentRepository.countByBranch(branchId);
        const active = await this.departmentRepository.countByStatus(true);
        const inactive = await this.departmentRepository.countByStatus(false);

        return {
            branchId,
            total,
            active,
            inactive,
        };
    }

    async getStatsByType(departmentTypeId: string): Promise<any> {
        const total = await this.departmentRepository.countByDepartmentType(departmentTypeId);
        const active = await this.departmentRepository.countByStatus(true);
        const inactive = await this.departmentRepository.countByStatus(false);

        return {
            departmentTypeId,
            total,
            active,
            inactive,
        };
    }

    // ========== UTILITY METHODS ==========

    async reorderDepartments(departmentIds: string[]): Promise<void> {
        // TODO: Implement reorder logic
        console.log('Reordering departments:', departmentIds);
    }

    async validateHierarchy(departmentId: string, parentId: string): Promise<boolean> {
        return !(await this.departmentRepository.isCircularReference(departmentId, parentId));
    }

    private mapToResponseDto(department: Department): DepartmentResponseDto {
        return {
            id: department.id,
            departmentCode: department.departmentCode,
            departmentName: department.departmentName,
            displayName: department.getDisplayName(),
            branchId: department.branchId,
            branchName: department.branch?.branchName,
            headOfDepartment: department.headOfDepartment,
            headNurse: department.headNurse,
            parentDepartmentId: department.parentDepartmentId,
            parentDepartmentName: department.parent?.departmentName,
            shortName: department.shortName,
            departmentTypeId: department.departmentTypeId,
            departmentTypeName: department.departmentType?.typeName,
            sortOrder: department.sortOrder,
            isActive: department.isActive,
            version: department.version,
            createdAt: department.createdAt,
            updatedAt: department.updatedAt,
            hierarchyLevel: department.getHierarchyLevel(),
            isRoot: department.isRootDepartment(),
            hasChildren: department.hasChildren(),
        };
    }
}
