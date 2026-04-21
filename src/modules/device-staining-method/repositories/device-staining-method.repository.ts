import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { DeviceStainingMethod } from '../entities/device-staining-method.entity';
import { IDeviceStainingMethodRepository } from '../interfaces/device-staining-method.repository.interface';

@Injectable()
export class DeviceStainingMethodRepository implements IDeviceStainingMethodRepository {
    constructor(
        @InjectRepository(DeviceStainingMethod)
        private readonly repository: Repository<DeviceStainingMethod>,
    ) { }

    async findById(id: string): Promise<DeviceStainingMethod | null> {
        return this.repository.findOne({ where: { id, deletedAt: IsNull() } });
    }

    async findByMethodName(methodName: string): Promise<DeviceStainingMethod | null> {
        return this.repository.findOne({
            where: { methodName, deletedAt: IsNull() },
        });
    }

    async existsByName(methodName: string): Promise<boolean> {
        const count = await this.repository.count({ where: { methodName, deletedAt: IsNull() } });
        return count > 0;
    }

    async save(entity: DeviceStainingMethod): Promise<DeviceStainingMethod> {
        return this.repository.save(entity);
    }

    async delete(id: string): Promise<void> {
        await this.repository.softDelete(id);
    }

    async findWithPagination(limit: number, offset: number, search?: string): Promise<[DeviceStainingMethod[], number]> {
        const qb = this.repository
            .createQueryBuilder('method')
            .where('method.deletedAt IS NULL')
            .orderBy('method.createdAt', 'DESC')
            .limit(limit)
            .offset(offset);

        if (search) {
            const term = `%${search.toLowerCase()}%`;
            qb.andWhere(
                '(LOWER(method.methodName) LIKE :search OR LOWER(method.protocolNo) LIKE :search)',
                { search: term },
            );
        }

        return qb.getManyAndCount();
    }
}
