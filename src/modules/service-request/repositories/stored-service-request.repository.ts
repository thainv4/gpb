import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { StoredServiceRequest } from '../entities/stored-service-request.entity';
import { IStoredServiceRequestRepository } from '../interfaces/stored-service-request.repository.interface';

@Injectable()
export class StoredServiceRequestRepository implements IStoredServiceRequestRepository {
    constructor(
        @InjectRepository(StoredServiceRequest)
        private readonly repo: Repository<StoredServiceRequest>,
    ) { }

    async findById(id: string): Promise<StoredServiceRequest | null> {
        return this.repo.findOne({
            where: { id, deletedAt: IsNull() },
        });
    }

    async findByIdWithRelations(id: string): Promise<StoredServiceRequest | null> {
        return this.repo.findOne({
            where: { id, deletedAt: IsNull() },
            relations: ['services', 'services.children'],
            order: {
                services: {
                    testOrder: 'ASC',
                    createdAt: 'ASC',
                    children: {
                        testOrder: 'ASC',
                        createdAt: 'ASC',
                    },
                },
            },
        });
    }

    async findByServiceReqCode(serviceReqCode: string): Promise<StoredServiceRequest | null> {
        return this.repo.findOne({
            where: { serviceReqCode, deletedAt: IsNull() },
        });
    }

    async findByTreatmentCode(treatmentCode: string): Promise<StoredServiceRequest | null> {
        return this.repo.findOne({
            where: { treatmentCode, deletedAt: IsNull() },
            relations: ['services'],
        });
    }

    async save(entity: StoredServiceRequest): Promise<StoredServiceRequest> {
        return this.repo.save(entity);
    }

    async remove(id: string): Promise<void> {
        await this.repo.softDelete(id);
    }

    async hardDelete(id: string): Promise<void> {
        await this.repo.delete(id);
    }

    async getStoredServiceRequestTrend(params: {
        granularity: 'day' | 'week' | 'month';
        fromDate?: Date;
        toDate?: Date;
        currentRoomId?: string;
        currentDepartmentId?: string;
    }): Promise<Array<{ period: string; count: number }>> {
        const periodFormat =
            params.granularity === 'month'
                ? 'YYYY-MM'
                : params.granularity === 'week'
                  ? 'IYYY-IW'
                  : 'YYYY-MM-DD';

        const qb = this.repo
            .createQueryBuilder('sr')
            .select(`TO_CHAR(sr.createdAt, '${periodFormat}')`, 'period')
            .addSelect('COUNT(sr.id)', 'count')
            .where('sr.deletedAt IS NULL');

        if (params.fromDate) {
            qb.andWhere('sr.createdAt >= :fromDate', { fromDate: params.fromDate });
        }

        if (params.toDate) {
            qb.andWhere('sr.createdAt <= :toDate', { toDate: params.toDate });
        }

        if (params.currentRoomId) {
            qb.andWhere('sr.currentRoomId = :currentRoomId', {
                currentRoomId: params.currentRoomId,
            });
        }

        if (params.currentDepartmentId) {
            qb.andWhere('sr.currentDepartmentId = :currentDepartmentId', {
                currentDepartmentId: params.currentDepartmentId,
            });
        }

        const rows = await qb
            .groupBy(`TO_CHAR(sr.createdAt, '${periodFormat}')`)
            .orderBy(`TO_CHAR(sr.createdAt, '${periodFormat}')`, 'ASC')
            .getRawMany<{ period: string; count: string | number }>();

        return rows.map((row) => ({
            period: row.period,
            count: Number(row.count),
        }));
    }
}

