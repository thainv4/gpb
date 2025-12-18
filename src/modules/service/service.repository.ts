import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, Like, Between } from 'typeorm';
import { Service } from './entities/service.entity';
import { IServiceRepository } from './interfaces/service.repository.interface';

@Injectable()
export class ServiceRepository implements IServiceRepository {
    constructor(
        @InjectRepository(Service)
        private readonly serviceRepository: Repository<Service>,
    ) { }

    async findById(id: string): Promise<Service | null> {
        return this.serviceRepository.findOne({
            where: { id, deletedAt: IsNull() },
            relations: ['serviceGroup', 'parentService', 'subServices'],
        });
    }

    async findByServiceCode(serviceCode: string): Promise<Service | null> {
        return this.serviceRepository.findOne({
            where: { serviceCode, deletedAt: IsNull() },
            relations: ['serviceGroup', 'parentService', 'subServices'],
        });
    }

    async findByServiceGroupId(serviceGroupId: string): Promise<Service[]> {
        return this.serviceRepository.find({
            where: { serviceGroupId, deletedAt: IsNull() },
            relations: ['serviceGroup', 'parentService'],
            order: { numOrder: 'ASC', createdAt: 'ASC' },
        });
    }

    async findByParentServiceId(parentServiceId: string): Promise<Service[]> {
        return this.serviceRepository.find({
            where: { parentServiceId, deletedAt: IsNull() },
            relations: ['serviceGroup', 'parentService'],
            order: { numOrder: 'ASC', createdAt: 'ASC' },
        });
    }

    async findActiveServices(): Promise<Service[]> {
        return this.serviceRepository.find({
            where: { isActive: true, deletedAt: IsNull() },
            relations: ['serviceGroup', 'parentService'],
            order: { numOrder: 'ASC', createdAt: 'ASC' },
        });
    }

    async findServicesByPriceRange(minPrice: number, maxPrice: number): Promise<Service[]> {
        return this.serviceRepository.find({
            where: {
                currentPrice: Between(minPrice, maxPrice),
                deletedAt: IsNull(),
            },
            relations: ['serviceGroup', 'parentService'],
            order: { currentPrice: 'ASC' },
        });
    }

    async searchServices(searchTerm: string): Promise<Service[]> {
        return this.serviceRepository
            .createQueryBuilder('service')
            .leftJoinAndSelect('service.serviceGroup', 'serviceGroup')
            .leftJoinAndSelect('service.parentService', 'parentService')
            .where('service.deletedAt IS NULL')
            .andWhere(
                '(UPPER(service.serviceCode) LIKE UPPER(:searchTerm) OR UPPER(service.serviceName) LIKE UPPER(:searchTerm) OR UPPER(service.shortName) LIKE UPPER(:searchTerm))',
                { searchTerm: `%${searchTerm}%` }
            )
            .orderBy('service.numOrder', 'ASC')
            .addOrderBy('service.createdAt', 'ASC')
            .getMany();
    }

    async findServicesWithChildren(serviceId: string): Promise<Service | null> {
        return this.serviceRepository.findOne({
            where: { id: serviceId, deletedAt: IsNull() },
            relations: ['serviceGroup', 'parentService', 'subServices', 'subServices.serviceGroup'],
        });
    }

    async findServiceHierarchy(serviceId: string): Promise<Service | null> {
        return this.serviceRepository.findOne({
            where: { id: serviceId, deletedAt: IsNull() },
            relations: [
                'serviceGroup',
                'parentService',
                'subServices',
                'subServices.subServices',
                'subServices.serviceGroup',
            ],
        });
    }

    async findServicesByGroupId(groupId: string, limit = 10, offset = 0): Promise<{ services: Service[]; total: number }> {
        const [services, total] = await this.serviceRepository.findAndCount({
            where: { serviceGroupId: groupId, deletedAt: IsNull() },
            relations: ['serviceGroup', 'parentService'],
            order: { numOrder: 'ASC', createdAt: 'ASC' },
            take: limit,
            skip: offset,
        });
        return { services, total };
    }

    async getPaginatedServices(query: any): Promise<{ services: Service[]; total: number }> {
        const { limit = 10, offset = 0, serviceGroupId, parentServiceId, isActive, search } = query;
        const queryBuilder = this.serviceRepository.createQueryBuilder('service');

        queryBuilder
            .leftJoinAndSelect('service.serviceGroup', 'serviceGroup')
            .leftJoinAndSelect('service.parentService', 'parentService')
            .where('service.deletedAt IS NULL')
            .orderBy('service.numOrder', 'ASC')
            .addOrderBy('service.createdAt', 'ASC')
            .limit(limit)
            .offset(offset);

        if (serviceGroupId) {
            queryBuilder.andWhere('service.serviceGroupId = :serviceGroupId', { serviceGroupId });
        }

        if (parentServiceId !== undefined) {
            if (parentServiceId === null) {
                queryBuilder.andWhere('service.parentServiceId IS NULL');
            } else {
                queryBuilder.andWhere('service.parentServiceId = :parentServiceId', { parentServiceId });
            }
        }

        if (isActive !== undefined) {
            queryBuilder.andWhere('service.isActive = :isActive', { isActive: isActive ? 1 : 0 });
        }

        if (search) {
            queryBuilder.andWhere(
                '(UPPER(service.serviceCode) LIKE UPPER(:search) OR UPPER(service.serviceName) LIKE UPPER(:search) OR UPPER(service.shortName) LIKE UPPER(:search))',
                { search: `%${search}%` }
            );
        }

        const [services, total] = await queryBuilder.getManyAndCount();
        return { services, total };
    }

    async findServicesByHierarchyLevel(level: number): Promise<Service[]> {
        if (level === 0) {
            return this.findRootServices();
        }

        return this.serviceRepository
            .createQueryBuilder('service')
            .leftJoinAndSelect('service.serviceGroup', 'serviceGroup')
            .leftJoinAndSelect('service.parentService', 'parentService')
            .where('service.deletedAt IS NULL')
            .andWhere('service.parentServiceId IS NOT NULL')
            .orderBy('service.numOrder', 'ASC')
            .getMany();
    }

    async findRootServices(): Promise<Service[]> {
        return this.serviceRepository.find({
            where: { parentServiceId: IsNull(), deletedAt: IsNull() },
            relations: ['serviceGroup'],
            order: { numOrder: 'ASC', createdAt: 'ASC' },
        });
    }

    async findSubServicesByParentId(parentId: string): Promise<Service[]> {
        return this.serviceRepository.find({
            where: { parentServiceId: parentId, deletedAt: IsNull() },
            relations: ['serviceGroup', 'parentService'],
            order: { numOrder: 'ASC', createdAt: 'ASC' },
        });
    }

    async existsByServiceCode(serviceCode: string, excludeId?: string): Promise<boolean> {
        const queryBuilder = this.serviceRepository
            .createQueryBuilder('service')
            .where('service.serviceCode = :serviceCode', { serviceCode })
            .andWhere('service.deletedAt IS NULL');

        if (excludeId) {
            queryBuilder.andWhere('service.id != :excludeId', { excludeId });
        }

        const count = await queryBuilder.getCount();
        return count > 0;
    }

    async reorderServices(serviceIds: string[]): Promise<void> {
        for (let i = 0; i < serviceIds.length; i++) {
            await this.serviceRepository.update(serviceIds[i], { numOrder: i + 1 });
        }
    }

    async findServicesByMapping(mappingKey: string, mappingValue: string): Promise<Service[]> {
        return this.serviceRepository
            .createQueryBuilder('service')
            .leftJoinAndSelect('service.serviceGroup', 'serviceGroup')
            .leftJoinAndSelect('service.parentService', 'parentService')
            .where('service.deletedAt IS NULL')
            .andWhere(`JSON_EXTRACT(service.mapping, '$.${mappingKey}') = :mappingValue`, { mappingValue })
            .orderBy('service.numOrder', 'ASC')
            .getMany();
    }

    async save(service: Service): Promise<Service> {
        return this.serviceRepository.save(service);
    }

    async delete(id: string): Promise<void> {
        await this.serviceRepository.update(
            { id, deletedAt: IsNull() },
            { deletedAt: new Date() }
        );
    }
}
