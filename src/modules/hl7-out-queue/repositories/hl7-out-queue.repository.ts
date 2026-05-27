import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hl7OutQueue } from '../entities/hl7-out-queue.entity';
import { IHl7OutQueueRepository } from '../interfaces/hl7-out-queue.repository.interface';

@Injectable()
export class Hl7OutQueueRepository implements IHl7OutQueueRepository {
    constructor(
        @InjectRepository(Hl7OutQueue)
        private readonly repo: Repository<Hl7OutQueue>,
    ) {}

    async save(entity: Hl7OutQueue): Promise<Hl7OutQueue> {
        return this.repo.save(entity);
    }

    async findById(id: Buffer): Promise<Hl7OutQueue | null> {
        return this.repo.findOne({ where: { id } });
    }

    async findByLisCaseId(lisCaseId: string): Promise<Hl7OutQueue[]> {
        return this.repo.find({
            where: { lisCaseId },
            order: { createdTime: 'DESC' },
        });
    }

    async findWithPagination(
        limit: number,
        offset: number,
        filters?: { lisCaseId?: string },
    ): Promise<[Hl7OutQueue[], number]> {
        const qb = this.repo.createQueryBuilder('q').orderBy('q.createdTime', 'DESC');

        if (filters?.lisCaseId?.trim()) {
            qb.andWhere('q.lisCaseId = :lisCaseId', { lisCaseId: filters.lisCaseId.trim() });
        }

        qb.take(limit).skip(offset);
        return qb.getManyAndCount();
    }
}
