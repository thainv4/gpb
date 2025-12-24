import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Between, EntityManager } from 'typeorm';
import { SampleReception } from './entities/sample-reception.entity';
import { ISampleReceptionRepository } from './interfaces/sample-reception.repository.interface';

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
        
        // BƯỚC 2: Tìm MAX sequence number TOÀN BẢNG cho cùng prefix và date
        // Đây là sequence cao nhất đã được dùng bởi BẤT KỲ SampleType nào
        // LƯU Ý: Oracle không cho phép FOR UPDATE với aggregate functions (MAX)
        // Nên không dùng lock ở đây, sẽ lock khi verify uniqueness
        const pattern = `${codePrefix}${dateStr}%`;
        const prefixLength = codePrefix.length;
        const dateLength = dateStr.length;
        const startPos = prefixLength + dateLength + 1; // Vị trí bắt đầu của sequence trong code
        
        // Query để tìm MAX sequence number từ receptionCode
        // Không dùng lock vì Oracle không cho phép FOR UPDATE với MAX()
        const maxSequenceResult = await manager
            .createQueryBuilder()
            .select(`MAX(TO_NUMBER(SUBSTR(RECEPTION_CODE, ${startPos}, ${codeWidth})))`, 'MAX_SEQ')
            .from('BML_SAMPLE_RECEPTIONS', 'reception')
            .where('reception.RECEPTION_CODE LIKE :pattern', { pattern })
            .andWhere('reception.DELETED_AT IS NULL')
            .getRawOne();
        
        // Nếu không có code nào tồn tại → Dùng baseSequence
        const maxUsedSequence = maxSequenceResult?.MAX_SEQ 
            ? Number.parseInt(String(maxSequenceResult.MAX_SEQ), 10) 
            : 0;
        
        // BƯỚC 3: Chọn sequence = MAX(baseSequence, maxUsedSequence + 1)
        // Đảm bảo sequence >= baseSequence và > maxUsedSequence
        let nextSequence = Math.max(baseSequence, maxUsedSequence + 1);
        
        // BƯỚC 4: Verify uniqueness (có thể vẫn bị trùng nếu có gap hoặc race condition)
        let attempts = 0;
        const maxAttempts = 100;
        
        while (attempts < maxAttempts) {
            const paddedSequence = nextSequence.toString().padStart(codeWidth, '0');
            const receptionCode = `${codePrefix}${dateStr}${paddedSequence}`;
            
            // Check uniqueness với query builder và pessimistic lock
            // Dùng query builder thay vì findOne vì Oracle không cho phép FOR UPDATE với findOne
            const existing = await manager
                .createQueryBuilder(SampleReception, 'reception')
                .where('reception.receptionCode = :receptionCode', { receptionCode })
                .andWhere('reception.deletedAt IS NULL')
                .setLock('pessimistic_write')
                .getOne();
            
            if (!existing) {
                // Tìm thấy code unique!
                return { 
                    sequenceNumber: nextSequence, 
                    receptionCode 
                };
            }
            
            // Nếu trùng, tăng sequence và thử lại
            nextSequence++;
            attempts++;
        }
        
        // Nếu vượt quá maxAttempts → Throw error
        throw new Error(
            `Unable to generate unique reception code after ${maxAttempts} attempts. ` +
            `Base sequence: ${baseSequence}, Max used: ${maxUsedSequence}, Last attempted: ${nextSequence}`
        );
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
