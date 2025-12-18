import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ServiceGroup } from './entities/service-group.entity';
import { IServiceGroupRepository } from './interfaces/service-group.repository.interface';
import { CreateServiceGroupDto } from './dto/commands/create-service-group.dto';
import { UpdateServiceGroupDto } from './dto/commands/update-service-group.dto';
import { GetServiceGroupsDto } from './dto/queries/get-service-groups.dto';
import { SearchServiceGroupsDto } from './dto/queries/search-service-groups.dto';
import { ServiceGroupResponseDto } from './dto/responses/service-group-response.dto';
import { GetServiceGroupsResult } from './dto/responses/service-groups-list-response.dto';
import { DataLoaderService } from '../../shared/dataloaders/dataloader.service';
import { AppError } from '../../common/errors/app.error';
import { BaseService } from '../../common/services/base.service';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { CurrentUser as ICurrentUser } from '../../common/interfaces/current-user.interface';

@Injectable()
export class ServiceGroupService extends BaseService {
    constructor(
        @Inject('IServiceGroupRepository')
        private readonly serviceGroupRepository: IServiceGroupRepository,
        @Inject(DataSource)
        protected readonly dataSource: DataSource,
        private readonly dataLoaderService: DataLoaderService,
        @Inject(CurrentUserContextService)
        protected readonly currentUserContext: CurrentUserContextService,
    ) {
        super(dataSource, currentUserContext);
    }

    // ========== COMMANDS (Write Operations) ==========

    async createServiceGroup(createDto: CreateServiceGroupDto, currentUser: ICurrentUser): Promise<string> {
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            // Check if service group code already exists
            const existingServiceGroup = await this.serviceGroupRepository.findByCode(createDto.serviceGroupCode);
            if (existingServiceGroup) {
                throw AppError.conflict('Service group code already exists');
            }

            // Create service group
            const serviceGroup = new ServiceGroup();
            serviceGroup.serviceGroupCode = createDto.serviceGroupCode;
            serviceGroup.serviceGroupName = createDto.serviceGroupName;
            serviceGroup.shortName = createDto.shortName;
            serviceGroup.mapping = createDto.mapping;
            serviceGroup.description = createDto.description;
            serviceGroup.isActive = createDto.isActive ?? true;
            serviceGroup.sortOrder = createDto.sortOrder ?? await this.serviceGroupRepository.getNextSortOrder();
            serviceGroup.icon = createDto.icon;
            serviceGroup.color = createDto.color;

            serviceGroup.createdBy = currentUser.id;
            serviceGroup.updatedBy = currentUser.id;

            const savedServiceGroup = await manager.save(ServiceGroup, serviceGroup);
            return savedServiceGroup.id;
        });
    }

    async updateServiceGroup(id: string, updateDto: UpdateServiceGroupDto, currentUser: ICurrentUser): Promise<void> {
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            const serviceGroup = await this.serviceGroupRepository.findById(id);
            if (!serviceGroup) {
                throw AppError.notFound('Service group not found');
            }

            // Check if service group code already exists (if changing)
            if (updateDto.serviceGroupCode && updateDto.serviceGroupCode !== serviceGroup.serviceGroupCode) {
                const existingServiceGroup = await this.serviceGroupRepository.findByCode(updateDto.serviceGroupCode);
                if (existingServiceGroup) {
                    throw AppError.conflict('Service group code already exists');
                }
            }

            // Update fields
            Object.assign(serviceGroup, updateDto);
            serviceGroup.updatedBy = currentUser.id;

            await manager.save(ServiceGroup, serviceGroup);
        });
    }

    async deleteServiceGroup(id: string): Promise<void> {
        return this.transactionWithAudit(async (manager) => {
            const serviceGroup = await this.serviceGroupRepository.findById(id);
            if (!serviceGroup) {
                throw AppError.notFound('Service group not found');
            }

            await this.serviceGroupRepository.delete(id);
        });
    }

    async activateServiceGroup(id: string, currentUser: ICurrentUser): Promise<void> {
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            const serviceGroup = await this.serviceGroupRepository.findById(id);
            if (!serviceGroup) {
                throw AppError.notFound('Service group not found');
            }

            serviceGroup.isActive = true;
            serviceGroup.updatedBy = currentUser.id;

            await manager.save(ServiceGroup, serviceGroup);
        });
    }

    async deactivateServiceGroup(id: string, currentUser: ICurrentUser): Promise<void> {
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            const serviceGroup = await this.serviceGroupRepository.findById(id);
            if (!serviceGroup) {
                throw AppError.notFound('Service group not found');
            }

            serviceGroup.isActive = false;
            serviceGroup.updatedBy = currentUser.id;

            await manager.save(ServiceGroup, serviceGroup);
        });
    }

    // ========== QUERIES (Read Operations) ==========

    async getServiceGroupById(id: string): Promise<ServiceGroupResponseDto> {
        const serviceGroup = await this.serviceGroupRepository.findById(id);
        if (!serviceGroup) {
            throw AppError.notFound('Service group not found');
        }

        return this.mapServiceGroupToResponseDto(serviceGroup);
    }

    async getServiceGroupByCode(serviceGroupCode: string): Promise<ServiceGroupResponseDto> {
        const serviceGroup = await this.serviceGroupRepository.findByCode(serviceGroupCode);
        if (!serviceGroup) {
            throw AppError.notFound('Service group not found');
        }

        return this.mapServiceGroupToResponseDto(serviceGroup);
    }

    async getServiceGroups(query: GetServiceGroupsDto): Promise<GetServiceGroupsResult> {
        const { limit = 10, offset = 0, search, isActive, sortBy, sortOrder } = query;

        const [serviceGroups, total] = await this.serviceGroupRepository.findWithPagination(
            limit,
            offset,
            search,
            isActive
        );

        return {
            serviceGroups: serviceGroups.map(sg => this.mapServiceGroupToResponseDto(sg)),
            total,
            limit,
            offset,
        };
    }

    async searchServiceGroups(query: SearchServiceGroupsDto): Promise<ServiceGroupResponseDto[]> {
        const { search, isActive, sortBy, sortOrder, limit } = query;

        const serviceGroups = await this.serviceGroupRepository.searchServiceGroups(
            search,
            isActive,
            sortBy,
            sortOrder
        );

        return serviceGroups
            .slice(0, limit || 50)
            .map(sg => this.mapServiceGroupToResponseDto(sg));
    }

    async getActiveServiceGroups(): Promise<ServiceGroupResponseDto[]> {
        const serviceGroups = await this.serviceGroupRepository.findActiveServiceGroups();
        return serviceGroups.map(sg => this.mapServiceGroupToResponseDto(sg));
    }

    async getServiceGroupsByMapping(mapping: string): Promise<ServiceGroupResponseDto[]> {
        const serviceGroups = await this.serviceGroupRepository.findByMapping(mapping);
        return serviceGroups.map(sg => this.mapServiceGroupToResponseDto(sg));
    }

    // ========== PRIVATE METHODS ==========

    private mapServiceGroupToResponseDto(serviceGroup: ServiceGroup): ServiceGroupResponseDto {
        return {
            id: serviceGroup.id,
            serviceGroupCode: serviceGroup.serviceGroupCode,
            serviceGroupName: serviceGroup.serviceGroupName,
            shortName: serviceGroup.shortName,
            mapping: serviceGroup.mapping,
            description: serviceGroup.description,
            isActive: serviceGroup.isActive,
            sortOrder: serviceGroup.sortOrder,
            icon: serviceGroup.icon,
            color: serviceGroup.color,
            displayName: serviceGroup.getDisplayName(),
            shortDisplayName: serviceGroup.getShortDisplayName(),
            createdAt: serviceGroup.createdAt,
            updatedAt: serviceGroup.updatedAt,
            createdBy: serviceGroup.createdBy,
            updatedBy: serviceGroup.updatedBy,
            version: serviceGroup.version,
        };
    }
}
