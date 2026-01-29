import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Between, EntityManager } from 'typeorm';
import { SampleReception } from './entities/sample-reception.entity';
import { ReceptionCodeSeq } from './entities/reception-code-seq.entity';
import { ISampleReceptionRepository } from './interfaces/sample-reception.repository.interface';
import { isUniqueConstraintError } from '../../common/helpers/db.helper';

@Injectable()
export class SampleReceptionRepository implements ISampleReceptionRepository {
    constructor(
        @InjectRepository(SampleReception)
        private readonly sampleReceptionRepository: Repository<SampleReception>,
    ) { }

    async findById(id: string): Promise<SampleReception | null> {
        return this.sampleReceptionRepository.findOne({
            where: { id, deletedAt: IsNull() },
            relations: ['sampleType'],
        });
    }

    async findByCode(receptionCode: string): Promise<SampleReception | null> {
        return this.sampleReceptionRepository.findOne({
            where: { receptionCode, deletedAt: IsNull() },
            relations: ['sampleType'],
        });
    }

    async existsByCode(receptionCode: string): Promise<boolean> {
        return this.sampleReceptionRepository.count({
            where: { receptionCode, deletedAt: IsNull() },
        }).then(count => count > 0);
    }

    async save(sampleReception: SampleReception): Promise<SampleReception> {
        return this.sampleReceptionRepository.save(sampleReception);
    }

    async delete(id: string): Promise<void> {
        await this.sampleReceptionRepository.softDelete(id);
    }

    async findWithPagination(
        limit: number,
        offset: number,
        search?: string,
    ): Promise<[SampleReception[], number]> {
        const queryBuilder = this.sampleReceptionRepository.createQueryBuilder('reception');

        queryBuilder.leftJoinAndSelect('reception.sampleType', 'sampleType');
        queryBuilder.where('reception.deletedAt IS NULL');

        if (search) {
            queryBuilder.andWhere(
                '(reception.receptionCode LIKE :search OR sampleType.typeName LIKE :search)',
                { search: `%${search}%` },
            );
        }

        queryBuilder.orderBy('reception.receptionDate', 'DESC');
        queryBuilder.addOrderBy('reception.sequenceNumber', 'ASC');

        queryBuilder.take(limit);
        queryBuilder.skip(offset);

        return queryBuilder.getManyAndCount();
    }

    async countByDateAndType(sampleTypeCode: string, date: Date): Promise<number> {
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

        return this.sampleReceptionRepository
            .createQueryBuilder('reception')
            .leftJoin('reception.sampleType', 'sampleType')
            .where('sampleType.typeCode = :sampleTypeCode', { sampleTypeCode })
            .andWhere('reception.receptionDate BETWEEN :startDate AND :endDate', {
                startDate: startOfMonth,
                endDate: endOfMonth,
            })
            .andWhere('reception.deletedAt IS NULL')
            .getCount();
    }

    async findTodayReceptions(): Promise<SampleReception[]> {
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        return this.sampleReceptionRepository.find({
            where: {
                receptionDate: Between(startOfDay, endOfDay),
                deletedAt: IsNull(),
            },
            relations: ['sampleType'],
            order: { sequenceNumber: 'ASC' },
        });
    }

    async findByDateRange(startDate: Date, endDate: Date): Promise<SampleReception[]> {
        return this.sampleReceptionRepository.find({
            where: {
                receptionDate: Between(startDate, endDate),
                deletedAt: IsNull(),
            },
            relations: ['sampleType'],
            order: { receptionDate: 'DESC', sequenceNumber: 'ASC' },
        });
    }

    async getNextSequenceNumber(
        sampleTypeId: string, 
        date: Date, 
        resetPeriod?: string,
        manager?: EntityManager
    ): Promise<number> {
        let whereCondition = '';
        let parameters: any = { sampleTypeId };

        switch (resetPeriod) {
            case 'DAILY': {
                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);
                whereCondition = 'sampleReception.receptionDate BETWEEN :startOfDay AND :endOfDay';
                parameters = { ...parameters, startOfDay, endOfDay };
                break;
            }
            case 'MONTHLY': {
                const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
                const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
                whereCondition = 'sampleReception.receptionDate BETWEEN :startOfMonth AND :endOfMonth';
                parameters = { ...parameters, startOfMonth, endOfMonth };
                break;
            }
            case 'YEARLY': {
                const startOfYear = new Date(date.getFullYear(), 0, 1);
                const endOfYear = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
                whereCondition = 'sampleReception.receptionDate BETWEEN :startOfYear AND :endOfYear';
                parameters = { ...parameters, startOfYear, endOfYear };
                break;
            }
            case 'NEVER':
                whereCondition = '1=1'; // Đếm tất cả records
                break;
            default: {
                // Default: MONTHLY
                const startOfMonthDefault = new Date(date.getFullYear(), date.getMonth(), 1);
                const endOfMonthDefault = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
                whereCondition = 'sampleReception.receptionDate BETWEEN :startOfMonth AND :endOfMonth';
                parameters = { ...parameters, startOfMonth: startOfMonthDefault, endOfMonth: endOfMonthDefault };
                break;
            }
        }

        // Sử dụng manager từ transaction hoặc repository mặc định
        const repository = manager 
            ? manager.getRepository(SampleReception)
            : this.sampleReceptionRepository;

        // LƯU Ý: Oracle không cho phép FOR UPDATE với aggregate functions (MAX)
        // Không dùng lock ở đây, lock sẽ được dùng khi verify uniqueness
        const result = await repository
            .createQueryBuilder('sampleReception')
            .select('MAX(sampleReception.sequenceNumber)', 'maxSequence')
            .where('sampleReception.sampleTypeId = :sampleTypeId', { sampleTypeId })
            .andWhere(whereCondition, parameters)
            .andWhere('sampleReception.deletedAt IS NULL')
            .getRawOne();

        return (result?.maxSequence || 0) + 1;
    }

    async getNextUniqueSequenceNumber(
        sampleTypeId: string,
        codePrefix: string,
        dateStr: string,
        codeWidth: number,
        date: Date,
        resetPeriod: string,
        manager: EntityManager
    ): Promise<{ sequenceNumber: number; receptionCode: string }> {
        // BƯỚC 1: Lấy base sequence number theo sampleTypeId
        const baseSequence = await this.getNextSequenceNumber(
            sampleTypeId, 
            date, 
            resetPeriod,
            manager
        );
        
        // BƯỚC 2: Tìm MAX sequence number TOÀN BẢNG cho cùng prefix và date. Format: {prefix}{dateStr}.{seq} (vd: T2601.2341).
        const pattern = `${codePrefix}${dateStr}.%`;
        const prefixLength = codePrefix.length;
        const dateLength = dateStr.length;
        const startPos = prefixLength + dateLength + 2; // sequence bắt đầu sau dấu chấm

        const maxSequenceResult = await manager
            .createQueryBuilder()
            .select(`MAX(TO_NUMBER(SUBSTR(reception.RECEPTION_CODE, ${startPos}, ${codeWidth})))`, 'MAX_SEQ')
            .from('BML_SAMPLE_RECEPTIONS', 'reception')
            .where('reception.RECEPTION_CODE LIKE :pattern', { pattern })
            .andWhere('reception.DELETED_AT IS NULL')
            .getRawOne();
        
        // Nếu không có code nào tồn tại → Dùng baseSequence
        const maxUsedSequence = maxSequenceResult?.MAX_SEQ 
            ? Number.parseInt(String(maxSequenceResult.MAX_SEQ), 10) 
            : 0;
        
        // BƯỚC 3: Chọn sequence = MAX(baseSequence, maxUsedSequence + 1)
        const nextSequence = Math.max(baseSequence, maxUsedSequence + 1);
        const paddedSequence = nextSequence.toString().padStart(codeWidth, '0');
        const receptionCode = `${codePrefix}${dateStr}.${paddedSequence}`;

        // Không check trùng ở đây: SELECT FOR UPDATE trên row không tồn tại không lock gì,
        // dễ race. Dựa vào INSERT + unique constraint; conflict → service retry cả tx.
        return { sequenceNumber: nextSequence, receptionCode };
    }

    async getNextUniqueSequenceNumberByPrefix(
        codePrefix: string,
        dateStr: string,
        codeWidth: number,
        _date: Date,
        _resetPeriod: string,
        manager: EntityManager
    ): Promise<{ sequenceNumber: number; receptionCode: string }> {
        return this.getNextSequenceFromSeqTable(codePrefix, dateStr, codeWidth, manager);
    }

    /**
     * Sinh code từ BML_RECEPTION_CODE_SEQ: lock dòng (prefix, dateStr) → tăng LAST_SEQ → return.
     * Tránh conflict; không cần retry do trùng code.
     * Nếu chưa có dòng: seed từ MAX(BML_SAMPLE_RECEPTIONS) rồi INSERT.
     */
    private async getNextSequenceFromSeqTable(
        prefix: string,
        dateStr: string,
        codeWidth: number,
        manager: EntityManager
    ): Promise<{ sequenceNumber: number; receptionCode: string }> {
        const repo = manager.getRepository(ReceptionCodeSeq);

        let row = await repo
            .createQueryBuilder('seq')
            .where('seq.prefix = :prefix', { prefix })
            .andWhere('seq.dateStr = :dateStr', { dateStr })
            .setLock('pessimistic_write')
            .getOne();

        if (!row) {
            const maxUsed = await this.getMaxUsedSequenceByPrefix(prefix, dateStr, codeWidth, manager);
            try {
                const newRow = repo.create({ prefix, dateStr, lastSeq: maxUsed });
                await manager.save(ReceptionCodeSeq, newRow);
                row = newRow;
            } catch (e: any) {
                if (!isUniqueConstraintError(e)) throw e;
                row = await repo
                    .createQueryBuilder('seq')
                    .where('seq.prefix = :prefix', { prefix })
                    .andWhere('seq.dateStr = :dateStr', { dateStr })
                    .setLock('pessimistic_write')
                    .getOne();
                if (!row) throw new Error('ReceptionCodeSeq: row missing after insert conflict');
            }
        }

        const maxUsed = await this.getMaxUsedSequenceByPrefix(prefix, dateStr, codeWidth, manager);
        const lastSeq = Math.max(row.lastSeq ?? 0, maxUsed);
        const next = lastSeq + 1;
        row.lastSeq = next;
        await manager.save(ReceptionCodeSeq, row);

        const padded = next.toString().padStart(codeWidth, '0');
        const receptionCode = `${prefix}${dateStr}.${padded}`;
        return { sequenceNumber: next, receptionCode };
    }

    /**
     * MAX sequence đã dùng cho prefix+dateStr. Format: {prefix}{dateStr}.{sequence} (vd: T2601.2341).
     * Sequence bắt đầu sau dấu chấm → startPos = prefixLength + dateLength + 2.
     */
    private async getMaxUsedSequenceByPrefix(
        codePrefix: string,
        dateStr: string,
        codeWidth: number,
        manager: EntityManager
    ): Promise<number> {
        const pattern = `${codePrefix}${dateStr}.%`;
        const prefixLength = codePrefix.length;
        const dateLength = dateStr.length;
        const startPos = prefixLength + dateLength + 2; // sau dấu chấm
        const maxResult = await manager
            .createQueryBuilder()
            .select(`MAX(TO_NUMBER(SUBSTR(r.RECEPTION_CODE, ${startPos}, ${codeWidth})))`, 'MAX_SEQ')
            .from('BML_SAMPLE_RECEPTIONS', 'r')
            .where('r.RECEPTION_CODE LIKE :pattern', { pattern })
            .andWhere('r.DELETED_AT IS NULL')
            .getRawOne();
        const v = maxResult?.MAX_SEQ;
        return v != null ? Number.parseInt(String(v), 10) : 0;
    }

    async findByReceptionCode(receptionCode: string): Promise<SampleReception | null> {
        return this.sampleReceptionRepository.findOne({
            where: {
                receptionCode,
                deletedAt: IsNull(),
            },
            relations: ['sampleType'],
        });
    }
}
