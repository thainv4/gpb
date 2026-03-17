import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { DeviceOutbound } from '../entities/device-outbound.entity';
import { IDeviceOutboundRepository } from '../interfaces/device-outbound.repository.interface';

@Injectable()
export class DeviceOutboundRepository implements IDeviceOutboundRepository {
    constructor(
        @InjectRepository(DeviceOutbound)
        private readonly repo: Repository<DeviceOutbound>,
    ) {}

    async save(entity: DeviceOutbound): Promise<DeviceOutbound> {
        return this.repo.save(entity);
    }

    async findById(id: string): Promise<DeviceOutbound | null> {
        return this.repo.findOne({
            where: { id, deletedAt: IsNull() },
        });
    }

    async findAndCount(
        limit: number,
        offset: number,
        filters?: { receptionCode?: string; serviceCode?: string },
    ): Promise<[DeviceOutbound[], number]> {
        const qb = this.repo
            .createQueryBuilder('d')
            .where('d.deletedAt IS NULL')
            .orderBy('d.createdAt', 'DESC')
            .take(limit)
            .skip(offset);

        if (filters?.receptionCode?.trim()) {
            qb.andWhere('d.receptionCode = :receptionCode', { receptionCode: filters.receptionCode.trim() });
        }
        if (filters?.serviceCode?.trim()) {
            qb.andWhere('d.serviceCode = :serviceCode', { serviceCode: filters.serviceCode.trim() });
        }

        return qb.getManyAndCount();
    }

    async delete(id: string): Promise<void> {
        await this.repo.softDelete(id);
    }
}
