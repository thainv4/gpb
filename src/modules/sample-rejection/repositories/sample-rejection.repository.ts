import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { SampleRejection } from '../entities/sample-rejection.entity';
import { ISampleRejectionRepository } from '../interfaces/sample-rejection.repository.interface';

@Injectable()
export class SampleRejectionRepository implements ISampleRejectionRepository {
    constructor(
        @InjectRepository(SampleRejection)
        private readonly repository: Repository<SampleRejection>,
    ) { }

    async findById(id: string): Promise<SampleRejection | null> {
        return this.repository.findOne({ where: { id, deletedAt: IsNull() } });
    }

    async save(sampleRejection: SampleRejection): Promise<SampleRejection> {
        return this.repository.save(sampleRejection);
    }

    async delete(id: string): Promise<void> {
        await this.repository.softDelete(id);
    }

    async findWithPagination(limit: number, offset: number, search?: string): Promise<[SampleRejection[], number]> {
        const qb = this.repository
            .createQueryBuilder('sr')
            .where('sr.deletedAt IS NULL')
            .orderBy('sr.rejectionTime', 'DESC')
            .limit(limit)
            .offset(offset);

        if (search?.trim()) {
            qb.andWhere(
                '(LOWER(sr.patientName) LIKE :search OR LOWER(sr.sampleCode) LIKE :search)',
                { search: `%${search.trim().toLowerCase()}%` },
            );
        }

        return qb.getManyAndCount();
    }
}
