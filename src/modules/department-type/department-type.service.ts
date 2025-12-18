import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DepartmentType } from './entities/department-type.entity';
import { IDepartmentTypeRepository } from './interfaces/department-type.repository.interface';
import { CreateDepartmentTypeDto } from './dto/commands/create-department-type.dto';
import { UpdateDepartmentTypeDto } from './dto/commands/update-department-type.dto';
import { GetDepartmentTypesDto } from './dto/queries/get-department-types.dto';
import { DepartmentTypeResponseDto } from './dto/responses/department-type-response.dto';
import { DataLoaderService } from '../../shared/dataloaders/dataloader.service';
import { AppError } from '../../common/errors/app.error';
import { BaseService } from '../../common/services/base.service';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';

export interface CurrentUser {
    id: string;
    username: string;
    email: string;
}

export interface GetDepartmentTypesResult {
    departmentTypes: DepartmentTypeResponseDto[];
    total: number;
    limit: number;
    offset: number;
}

@Injectable()
export class DepartmentTypeService extends BaseService {
    constructor(
        @Inject('IDepartmentTypeRepository')
        private readonly departmentTypeRepository: IDepartmentTypeRepository,
        @Inject(DataSource)
        protected readonly dataSource: DataSource,
        private readonly dataLoaderService: DataLoaderService,
        @Inject(CurrentUserContextService)
        protected readonly currentUserContext: CurrentUserContextService,
    ) {
        super(dataSource, currentUserContext);
    }

    // ========== COMMANDS (Write Operations) ==========

    async createDepartmentType(
        createDto: CreateDepartmentTypeDto,
        currentUser: CurrentUser
    ): Promise<string> {
        // Set current user context for automatic audit
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            // Check if department type code already exists
            const existingByCode = await this.departmentTypeRepository.existsByCode(createDto.typeCode);
            if (existingByCode) {
                throw AppError.conflict('Department type with this code already exists');
            }

            // Check if department type name already exists
            const existingByName = await this.departmentTypeRepository.existsByName(createDto.typeName);
            if (existingByName) {
                throw AppError.conflict('Department type with this name already exists');
            }

            const departmentType = new DepartmentType();
            departmentType.typeCode = createDto.typeCode;
            departmentType.typeName = createDto.typeName;
            departmentType.description = createDto.description;
            departmentType.sortOrder = createDto.sortOrder ?? await this.getNextSortOrder();

            // ✅ Automatic audit fields - no manual assignment needed!
            this.setAuditFields(departmentType, false); // false = create operation

            const savedDepartmentType = await manager.save(DepartmentType, departmentType);
            return savedDepartmentType.id;
        });
    }

    async updateDepartmentType(
        id: string,
        updateDto: UpdateDepartmentTypeDto,
        currentUser: CurrentUser
    ): Promise<void> {
        // Set current user context for automatic audit
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            const departmentType = await this.departmentTypeRepository.findById(id);
            if (!departmentType) {
                throw AppError.notFound('Department type not found');
            }

            // Note: typeCode is not updatable in this DTO

            // Check if department type name already exists (if changed)
            if (updateDto.typeName && updateDto.typeName !== departmentType.typeName) {
                const exists = await this.departmentTypeRepository.existsByName(updateDto.typeName, id);
                if (exists) {
                    throw AppError.conflict('Department type with this name already exists');
                }
            }

            Object.assign(departmentType, updateDto);

            // ✅ Automatic audit fields - no manual assignment needed!
            this.setAuditFields(departmentType, true); // true = update operation

            await manager.save(DepartmentType, departmentType);
        });
    }

    async deleteDepartmentType(id: string, hardDelete: boolean = false): Promise<void> {
        const departmentType = await this.departmentTypeRepository.findById(id);
        if (!departmentType) {
            throw AppError.notFound('Department type not found');
        }

        if (hardDelete) {
            await this.departmentTypeRepository.delete(id);
        } else {
            await this.departmentTypeRepository.softDelete(id);
        }
    }

    // ========== QUERIES (Read Operations) ==========

    async getDepartmentTypeById(id: string): Promise<DepartmentTypeResponseDto> {
        const departmentType = await this.departmentTypeRepository.findById(id);
        if (!departmentType) {
            throw AppError.notFound('Department type not found');
        }
        return this.mapDepartmentTypeToResponseDto(departmentType);
    }

    async getDepartmentTypes(query: GetDepartmentTypesDto): Promise<GetDepartmentTypesResult> {
        const { limit = 10, offset = 0, search, isActive, sortBy = 'sortOrder', sortOrder = 'ASC' } = query;

        const [departmentTypes, total] = await this.departmentTypeRepository.findWithPagination(
            limit,
            offset,
            sortBy,
            sortOrder,
            { isActive, search }
        );

        return {
            departmentTypes: departmentTypes.map(departmentType => this.mapDepartmentTypeToResponseDto(departmentType)),
            total,
            limit,
            offset,
        };
    }

    async getDepartmentTypesWithStats(query: GetDepartmentTypesDto): Promise<GetDepartmentTypesResult> {
        const { limit = 10, offset = 0, search, isActive, sortBy = 'sortOrder', sortOrder = 'ASC' } = query;

        const [departmentTypes, total] = await this.departmentTypeRepository.findWithPagination(
            limit,
            offset,
            sortBy,
            sortOrder,
            { isActive, search }
        );

        const loaders = this.dataLoaderService.createLoaders();

        const departmentTypesWithStats = await Promise.all(
            departmentTypes.map(async (departmentType) => {
                return {
                    ...this.mapDepartmentTypeToResponseDto(departmentType),
                };
            })
        );

        return {
            departmentTypes: departmentTypesWithStats,
            total,
            limit,
            offset,
        };
    }

    // ========== STATISTICS ==========

    async getStatsOverview(): Promise<any> {
        const total = await this.departmentTypeRepository.countTotal();
        const active = await this.departmentTypeRepository.countActive();
        const inactive = await this.departmentTypeRepository.countInactive();

        return {
            total,
            active,
            inactive,
            activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
        };
    }

    // ========== UTILITY METHODS ==========

    async reorderDepartmentTypes(departmentTypeIds: string[]): Promise<void> {
        return this.dataSource.transaction(async (manager) => {
            for (let i = 0; i < departmentTypeIds.length; i++) {
                const departmentType = await this.departmentTypeRepository.findById(departmentTypeIds[i]);
                if (departmentType) {
                    departmentType.sortOrder = i + 1;
                    await manager.save(DepartmentType, departmentType);
                }
            }
        });
    }

    private async getNextSortOrder(): Promise<number> {
        return this.departmentTypeRepository.getNextSortOrder();
    }

    private mapDepartmentTypeToResponseDto(departmentType: DepartmentType): DepartmentTypeResponseDto {
        return {
            id: departmentType.id,
            typeCode: departmentType.typeCode,
            typeName: departmentType.typeName,
            description: departmentType.description,
            displayName: departmentType.getDisplayName(),
            sortOrder: departmentType.sortOrder,
            isActive: departmentType.isActive,
            version: departmentType.version,
            createdAt: departmentType.createdAt,
            updatedAt: departmentType.updatedAt,
        };
    }
}