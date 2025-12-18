import { Injectable, Inject, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Service } from './entities/service.entity';
import { IServiceRepository } from './interfaces/service.repository.interface';
import { CreateServiceDto } from './dto/commands/create-service.dto';
import { UpdateServiceDto } from './dto/commands/update-service.dto';
import { GetServicesDto } from './dto/queries/get-services.dto';
import { SearchServicesDto } from './dto/queries/search-services.dto';
import { ServiceResponseDto } from './dto/responses/service-response.dto';
import { ServiceWithChildrenResponseDto } from './dto/responses/service-with-children-response.dto';
import { ServiceHierarchyResponseDto } from './dto/responses/service-hierarchy-response.dto';
import { GetServicesResult } from './dto/responses/services-list-response.dto';
import { BaseService } from '../../common/services/base.service';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { CurrentUser } from '../../common/interfaces/current-user.interface';

@Injectable()
export class ServiceService extends BaseService {
    constructor(
        @Inject('IServiceRepository')
        private readonly serviceRepository: IServiceRepository,
        @Inject(DataSource)
        protected readonly dataSource: DataSource,
        @Inject(CurrentUserContextService)
        protected readonly currentUserContext: CurrentUserContextService,
    ) {
        super(dataSource, currentUserContext);
    }

    // ========== COMMANDS (Write Operations) ==========

    async createService(createServiceDto: CreateServiceDto, currentUser: CurrentUser): Promise<string> {
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            // Kiểm tra mã dịch vụ đã tồn tại chưa
            const existingService = await this.serviceRepository.findByServiceCode(createServiceDto.serviceCode);
            if (existingService) {
                throw new ConflictException(`Dịch vụ với mã ${createServiceDto.serviceCode} đã tồn tại`);
            }

            // Kiểm tra dịch vụ cha có tồn tại không (nếu có)
            if (createServiceDto.parentServiceId) {
                const parentService = await this.serviceRepository.findById(createServiceDto.parentServiceId);
                if (!parentService) {
                    throw new NotFoundException(`Dịch vụ cha với ID ${createServiceDto.parentServiceId} không tồn tại`);
                }
            }

            // Tạo dịch vụ mới
            const service = new Service();
            Object.assign(service, createServiceDto);
            service.isActive = createServiceDto.isActive ?? true;
            service.numOrder = createServiceDto.numOrder ?? 0;
            service.currentPrice = createServiceDto.currentPrice ?? 0;

            this.setAuditFields(service, false); // false = create operation
            const savedService = await manager.save(Service, service);
            return savedService.id;
        });
    }

    async updateService(id: string, updateServiceDto: UpdateServiceDto, currentUser: CurrentUser): Promise<void> {
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            const service = await this.serviceRepository.findById(id);
            if (!service) {
                throw new NotFoundException(`Dịch vụ với ID ${id} không tồn tại`);
            }

            // Kiểm tra mã dịch vụ đã tồn tại chưa (nếu có thay đổi)
            if (updateServiceDto.serviceCode && updateServiceDto.serviceCode !== service.serviceCode) {
                const existingService = await this.serviceRepository.findByServiceCode(updateServiceDto.serviceCode);
                if (existingService) {
                    throw new ConflictException(`Dịch vụ với mã ${updateServiceDto.serviceCode} đã tồn tại`);
                }
            }

            // Kiểm tra dịch vụ cha có tồn tại không (nếu có thay đổi)
            if (updateServiceDto.parentServiceId && updateServiceDto.parentServiceId !== service.parentServiceId) {
                const parentService = await this.serviceRepository.findById(updateServiceDto.parentServiceId);
                if (!parentService) {
                    throw new NotFoundException(`Dịch vụ cha với ID ${updateServiceDto.parentServiceId} không tồn tại`);
                }
            }

            // Cập nhật dịch vụ
            Object.assign(service, updateServiceDto);
            this.setAuditFields(service, true); // true = update operation
            await manager.save(Service, service);
        });
    }

    async deleteService(id: string, currentUser: CurrentUser): Promise<void> {
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            const service = await this.serviceRepository.findById(id);
            if (!service) {
                throw new NotFoundException(`Dịch vụ với ID ${id} không tồn tại`);
            }

            // Kiểm tra có dịch vụ con không
            const subServices = await this.serviceRepository.findByParentServiceId(id);
            if (subServices.length > 0) {
                throw new BadRequestException(`Không thể xóa dịch vụ có ${subServices.length} dịch vụ con. Vui lòng xóa các dịch vụ con trước.`);
            }

            this.setAuditFields(service, true); // true = update operation (soft delete)
            service.deletedAt = new Date();
            await manager.save(Service, service);
        });
    }

    async reorderServices(serviceIds: string[], currentUser: CurrentUser): Promise<void> {
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            await this.serviceRepository.reorderServices(serviceIds);
        });
    }

    // ========== QUERIES (Read Operations) ==========

    async getServiceById(id: string): Promise<ServiceResponseDto> {
        const service = await this.serviceRepository.findById(id);
        if (!service) {
            throw new NotFoundException(`Dịch vụ với ID ${id} không tồn tại`);
        }

        return this.mapServiceToResponseDto(service);
    }

    async getServiceWithChildren(id: string): Promise<ServiceWithChildrenResponseDto> {
        const service = await this.serviceRepository.findServicesWithChildren(id);
        if (!service) {
            throw new NotFoundException(`Dịch vụ với ID ${id} không tồn tại`);
        }

        const response = this.mapServiceToResponseDto(service) as ServiceWithChildrenResponseDto;
        response.subServices = service.subServices?.map(sub => this.mapServiceToResponseDto(sub)) || [];
        return response;
    }

    async getServiceHierarchy(id: string): Promise<ServiceHierarchyResponseDto> {
        const service = await this.serviceRepository.findServiceHierarchy(id);
        if (!service) {
            throw new NotFoundException(`Dịch vụ với ID ${id} không tồn tại`);
        }

        const response = this.mapServiceToResponseDto(service) as ServiceHierarchyResponseDto;
        response.children = this.buildHierarchyTree(service.subServices || []);
        return response;
    }

    async getServices(query: GetServicesDto): Promise<GetServicesResult> {
        const { services, total } = await this.serviceRepository.getPaginatedServices(query);
        const mappedServices = services.map(service => this.mapServiceToResponseDto(service));
        return {
            services: mappedServices,
            total,
            limit: query.limit || 10,
            offset: query.offset || 0
        };
    }

    async searchServices(query: SearchServicesDto): Promise<GetServicesResult> {
        const { services, total } = await this.serviceRepository.getPaginatedServices({
            ...query,
            search: query.search
        });
        const mappedServices = services.map(service => this.mapServiceToResponseDto(service));
        return {
            services: mappedServices,
            total,
            limit: query.limit || 10,
            offset: query.offset || 0
        };
    }

    async getServicesByGroup(groupId: string, limit = 10, offset = 0): Promise<GetServicesResult> {
        const { services, total } = await this.serviceRepository.findServicesByGroupId(groupId, limit, offset);
        const mappedServices = services.map(service => this.mapServiceToResponseDto(service));
        return {
            services: mappedServices,
            total,
            limit,
            offset
        };
    }

    async getRootServices(): Promise<ServiceResponseDto[]> {
        const services = await this.serviceRepository.findRootServices();
        return services.map(service => this.mapServiceToResponseDto(service));
    }

    async getSubServices(parentId: string): Promise<ServiceResponseDto[]> {
        const services = await this.serviceRepository.findSubServicesByParentId(parentId);
        return services.map(service => this.mapServiceToResponseDto(service));
    }

    async getServicesByPriceRange(minPrice: number, maxPrice: number): Promise<ServiceResponseDto[]> {
        const services = await this.serviceRepository.findServicesByPriceRange(minPrice, maxPrice);
        return services.map(service => this.mapServiceToResponseDto(service));
    }

    // ========== MAPPING ==========

    private mapServiceToResponseDto(service: Service): ServiceResponseDto {
        const dto = new ServiceResponseDto();

        // Map base fields
        dto.id = service.id;
        dto.createdAt = service.createdAt;
        dto.updatedAt = service.updatedAt;
        dto.deletedAt = service.deletedAt;
        dto.createdBy = service.createdBy;
        dto.updatedBy = service.updatedBy;
        dto.version = service.version;

        dto.serviceCode = service.serviceCode;
        dto.serviceName = service.serviceName;
        dto.shortName = service.shortName;
        dto.serviceGroupId = service.serviceGroupId;
        dto.serviceGroupName = service.serviceGroup?.serviceGroupName;
        dto.unitOfMeasureId = service.unitOfMeasureId;
        dto.unitOfMeasureName = undefined; // Will be implemented when UnitOfMeasure module is created
        dto.mapping = service.mapping;
        dto.numOrder = service.numOrder;
        dto.currentPrice = service.currentPrice;
        dto.parentServiceId = service.parentServiceId;
        dto.parentServiceName = service.parentService?.serviceName;
        dto.description = service.description;
        dto.isActive = service.isActive;
        dto.hierarchyLevel = service.getHierarchyLevel();
        dto.isSubService = service.isSubService();
        dto.fullServiceName = service.getFullServiceName();
        dto.hasChildren = service.hasChildren();
        dto.childrenCount = service.getSubServicesCount();
        dto.totalPrice = service.calculateTotalPrice();

        return dto;
    }

    private buildHierarchyTree(services: Service[]): ServiceHierarchyResponseDto[] {
        return services.map(service => {
            const response = this.mapServiceToResponseDto(service) as ServiceHierarchyResponseDto;
            response.children = this.buildHierarchyTree(service.subServices || []);
            return response;
        });
    }
}
