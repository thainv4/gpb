import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { ServiceRequestAuditLog } from '../entities/service-request-audit-log.entity';
import {
    FindAuditLogsParams,
    IServiceRequestAuditLogRepository,
} from '../interfaces/service-request-audit-log.repository.interface';

@Injectable()
export class ServiceRequestAuditLogRepository implements IServiceRequestAuditLogRepository {
    constructor(
        @InjectRepository(ServiceRequestAuditLog)
        private readonly repo: Repository<ServiceRequestAuditLog>,
    ) {}

    save(entity: ServiceRequestAuditLog): Promise<ServiceRequestAuditLog> {
        return this.repo.save(entity);
    }

    findById(id: string): Promise<ServiceRequestAuditLog | null> {
        return this.repo.findOne({ where: { id } });
    }

    async findMany(params: FindAuditLogsParams): Promise<{ items: ServiceRequestAuditLog[]; total: number }> {
        const qb = this.repo.createQueryBuilder('log');

        if (params.fromDate) {
            qb.andWhere('log.occurredAt >= :fromDate', { fromDate: params.fromDate });
        }
        if (params.toDate) {
            qb.andWhere('log.occurredAt <= :toDate', { toDate: params.toDate });
        }
        if (params.code?.trim()) {
            const code = `%${params.code.trim().toUpperCase()}%`;
            qb.andWhere(
                new Brackets((sub) => {
                    sub
                        .where('UPPER(log.serviceReqCode) LIKE :code', { code })
                        .orWhere('UPPER(log.hisServiceReqCode) LIKE :code', { code })
                        .orWhere('UPPER(log.receptionCode) LIKE :code', { code });
                }),
            );
        }
        if (params.patientName?.trim()) {
            qb.andWhere('UPPER(log.patientName) LIKE :patientName', {
                patientName: `%${params.patientName.trim().toUpperCase()}%`,
            });
        }
        if (params.roomId?.trim()) {
            qb.andWhere('log.actionRoomId = :roomId', { roomId: params.roomId.trim() });
        } else if (params.roomIds !== undefined) {
            if (params.roomIds.length === 0) {
                qb.andWhere('1 = 0');
            } else {
                qb.andWhere('log.actionRoomId IN (:...roomIds)', { roomIds: params.roomIds });
            }
        }
        if (params.eventCategories?.length) {
            qb.andWhere('log.eventCategory IN (:...eventCategories)', {
                eventCategories: params.eventCategories,
            });
        }
        if (params.eventCodes?.length) {
            qb.andWhere('log.eventCode IN (:...eventCodes)', { eventCodes: params.eventCodes });
        }

        qb.orderBy('log.occurredAt', 'DESC');

        const total = await qb.getCount();
        const items = await qb.skip(params.offset).take(params.limit).getMany();

        return { items, total };
    }

    async findLatestByEventCode(
        storedServiceId: string,
        eventCode: string,
    ): Promise<ServiceRequestAuditLog | null> {
        return this.repo
            .createQueryBuilder('log')
            .where('log.storedServiceId = :storedServiceId', { storedServiceId })
            .andWhere('log.eventCode = :eventCode', { eventCode })
            .orderBy('log.occurredAt', 'DESC')
            .take(1)
            .getOne();
    }

    async findLatestByReqAndEventCode(
        storedServiceReqId: string,
        eventCode: string,
    ): Promise<ServiceRequestAuditLog | null> {
        return this.repo
            .createQueryBuilder('log')
            .where('log.storedServiceReqId = :storedServiceReqId', { storedServiceReqId })
            .andWhere('log.eventCode = :eventCode', { eventCode })
            .orderBy('log.occurredAt', 'DESC')
            .take(1)
            .getOne();
    }
}
