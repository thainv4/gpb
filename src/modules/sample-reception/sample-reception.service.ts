import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SampleReception } from './entities/sample-reception.entity';
import { ISampleReceptionRepository } from './interfaces/sample-reception.repository.interface';
import { CreateSampleReceptionDto } from './dto/commands/create-sample-reception.dto';
import { CreateSampleReceptionByPrefixDto } from './dto/commands/create-sample-reception-by-prefix.dto';
import { GetSampleReceptionsDto } from './dto/queries/get-sample-receptions.dto';
import { GenerateCodeDto } from './dto/queries/generate-code.dto';
import { GetSampleTypeByReceptionCodeDto } from './dto/queries/get-sample-type-by-reception-code.dto';
import { SampleReceptionResponseDto } from './dto/responses/sample-reception-response.dto';
import { GenerateCodeResponseDto } from './dto/responses/generate-code-response.dto';
import { DataLoaderService } from '../../shared/dataloaders/dataloader.service';
import { AppError } from '../../common/errors/app.error';
import { BaseService } from '../../common/services/base.service';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { CurrentUser } from '../../common/interfaces/current-user.interface';
import { ISampleTypeRepository } from '../sample-type/interfaces/sample-type.repository.interface';

export interface GetSampleReceptionsResult {
    receptions: SampleReceptionResponseDto[];
    total: number;
    limit: number;
    offset: number;
}

@Injectable()
export class SampleReceptionService extends BaseService {
    constructor(
        @Inject('ISampleReceptionRepository')
        private readonly sampleReceptionRepository: ISampleReceptionRepository,
        @Inject('ISampleTypeRepository')
        private readonly sampleTypeRepository: ISampleTypeRepository,
        @Inject(DataSource)
        protected readonly dataSource: DataSource,
        @Inject(CurrentUserContextService)
        protected readonly currentUserContext: CurrentUserContextService,
        private readonly dataLoaderService: DataLoaderService,
    ) {
        super(dataSource, currentUserContext);
    }

    // ========== COMMANDS (Write Operations) ==========

    async createSampleReception(createDto: CreateSampleReceptionDto, currentUser: CurrentUser): Promise<string> {
        this.currentUserContext.setCurrentUser(currentUser);

        const maxRetries = 3;
        let retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                return await this.transactionWithAudit(async (manager) => {
                    // 1. Tìm SampleType theo code
                    const sampleType = await this.sampleTypeRepository.findByCode(createDto.sampleTypeCode);
                    if (!sampleType) {
                        throw AppError.notFound('Sample type not found');
                    }

                    const targetDate = new Date();

                    // 2. Format date string
                    const dateStr = this.formatDateByResetPeriod(targetDate, sampleType.resetPeriod);

                    // 3. Tìm sequence number và code UNIQUE TOÀN BẢNG
                    // Method này sẽ tự động tăng sequence nếu code bị trùng với SampleType khác
                    const { sequenceNumber, receptionCode } = 
                        await this.sampleReceptionRepository.getNextUniqueSequenceNumber(
                            sampleType.id,
                            sampleType.codePrefix,
                            dateStr,
                            sampleType.codeWidth,
                            targetDate,
                            sampleType.resetPeriod,
                            manager  // Pass manager để dùng trong transaction với lock
                        );

                    // 4. Kiểm tra allowDuplicate (nếu cần)
                    if (!sampleType.allowDuplicate) {
                        // Code đã được check unique trong getNextUniqueSequenceNumber
                        // Nhưng có thể check lại để chắc chắn
                        const existing = await manager
                            .createQueryBuilder(SampleReception, 'reception')
                            .where('reception.receptionCode = :receptionCode', { receptionCode })
                            .andWhere('reception.deletedAt IS NULL')
                            .setLock('pessimistic_write')
                            .getOne();
                        if (existing) {
                            throw AppError.conflict('Reception code already exists');
                        }
                    }

                    // 5. Tạo record với sequence và code đã unique
                    const reception = new SampleReception();
                    reception.receptionCode = receptionCode;  // Code đã unique toàn bảng
                    reception.sampleTypeId = sampleType.id;
                    reception.receptionDate = targetDate;
                    reception.sequenceNumber = sequenceNumber;  // Sequence có thể > base sequence nếu bị conflict
                    reception.createdBy = currentUser.id;
                    reception.updatedBy = currentUser.id;

                    const savedReception = await manager.save(SampleReception, reception);
                    return savedReception.id;
                });
            } catch (error: any) {
                // Nếu là unique constraint violation hoặc conflict, retry
                if (error?.code === '23505' || error?.code === '23000' || 
                    error?.message?.includes('unique constraint') ||
                    error?.message?.includes('Reception code already exists') ||
                    error?.message?.includes('Unable to generate unique reception code')) {
                    retryCount++;
                    if (retryCount >= maxRetries) {
                        throw AppError.conflict('Failed to generate unique reception code after retries');
                    }
                    // Wait before retry (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
                    continue;
                }
                // Nếu là lỗi khác, throw ngay
                throw error;
            }
        }

        throw AppError.conflict('Failed to generate unique reception code');
    }

    async createSampleReceptionByPrefix(createDto: CreateSampleReceptionByPrefixDto, currentUser: CurrentUser): Promise<string> {
        this.currentUserContext.setCurrentUser(currentUser);

        const maxRetries = 3;
        let retryCount = 0;

        // Set defaults
        const codeWidth = createDto.codeWidth || 4;
        const resetPeriod = createDto.resetPeriod || 'MONTHLY';
        const allowDuplicate = createDto.allowDuplicate || false;

        while (retryCount < maxRetries) {
            try {
                return await this.transactionWithAudit(async (manager) => {
                    // Validate sampleTypeId nếu có
                    if (createDto.sampleTypeId) {
                        const sampleType = await this.sampleTypeRepository.findById(createDto.sampleTypeId);
                        if (!sampleType) {
                            throw AppError.notFound('Sample type not found');
                        }
                    }

                    const targetDate = new Date();

                    // Format date string
                    const dateStr = this.formatDateByResetPeriod(targetDate, resetPeriod);

                    // Tìm sequence number và code UNIQUE TOÀN BẢNG (không cần sampleTypeId)
                    const { sequenceNumber, receptionCode } = 
                        await this.sampleReceptionRepository.getNextUniqueSequenceNumberByPrefix(
                            createDto.prefix,
                            dateStr,
                            codeWidth,
                            targetDate,
                            resetPeriod,
                            manager
                        );

                    // Kiểm tra allowDuplicate (nếu cần)
                    if (!allowDuplicate) {
                        const existing = await manager
                            .createQueryBuilder(SampleReception, 'reception')
                            .where('reception.receptionCode = :receptionCode', { receptionCode })
                            .andWhere('reception.deletedAt IS NULL')
                            .setLock('pessimistic_write')
                            .getOne();
                        if (existing) {
                            throw AppError.conflict('Reception code already exists');
                        }
                    }

                    // Tạo record với sequence và code đã unique
                    const reception = new SampleReception();
                    reception.receptionCode = receptionCode;
                    reception.sampleTypeId = createDto.sampleTypeId || undefined; // Lưu sampleTypeId nếu có
                    reception.receptionDate = targetDate;
                    reception.sequenceNumber = sequenceNumber;
                    reception.createdBy = currentUser.id;
                    reception.updatedBy = currentUser.id;

                    const savedReception = await manager.save(SampleReception, reception);
                    return savedReception.id;
                });
            } catch (error: any) {
                // Nếu là unique constraint violation hoặc conflict, retry
                if (error?.code === '23505' || error?.code === '23000' || 
                    error?.message?.includes('unique constraint') ||
                    error?.message?.includes('Reception code already exists') ||
                    error?.message?.includes('Unable to generate unique reception code')) {
                    retryCount++;
                    if (retryCount >= maxRetries) {
                        throw AppError.conflict('Failed to generate unique reception code after retries');
                    }
                    await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
                    continue;
                }
                throw error;
            }
        }

        throw AppError.conflict('Failed to generate unique reception code');
    }

    async deleteSampleReception(id: string): Promise<void> {
        return this.transactionWithAudit(async (manager) => {
            const reception = await this.sampleReceptionRepository.findById(id);
            if (!reception) {
                throw AppError.notFound('Sample reception not found');
            }

            await this.sampleReceptionRepository.delete(id);
        });
    }

    // ========== QUERIES (Read Operations) ==========

    async getSampleReceptionById(id: string): Promise<SampleReceptionResponseDto> {
        const reception = await this.sampleReceptionRepository.findById(id);
        if (!reception) {
            throw AppError.notFound('Sample reception not found');
        }

        return this.mapReceptionToResponseDto(reception);
    }

    async getSampleReceptions(query: GetSampleReceptionsDto): Promise<GetSampleReceptionsResult> {
        const { limit = 10, offset = 0, search, sortBy = 'receptionDate', sortOrder = 'DESC' } = query;

        const [receptions, total] = await this.sampleReceptionRepository.findWithPagination(
            limit,
            offset,
            search
        );

        return {
            receptions: receptions.map(r => this.mapReceptionToResponseDto(r)),
            total,
            limit,
            offset,
        };
    }

    async generateReceptionCode(sampleTypeCode: string, sampleTypeId: string, date?: Date): Promise<string> {
        // 1. Lấy thông tin Sample Type với các fields mới
        const sampleType = await this.sampleTypeRepository.findById(sampleTypeId);
        if (!sampleType) {
            throw AppError.notFound('Sample type not found');
        }

        const targetDate = date || new Date();

        // 2. Xác định format ngày dựa trên resetPeriod
        const dateStr = this.formatDateByResetPeriod(targetDate, sampleType.resetPeriod);

        // 3. Lấy số thứ tự tiếp theo
        const nextSequence = await this.getNextSequenceNumber(sampleTypeId, targetDate, sampleType.resetPeriod);

        // 4. Tạo mã với format mới: {CODE_PREFIX}{DATE_FORMAT}.{SEQUENCE_NUMBER}
        const paddedSequence = nextSequence.toString().padStart(sampleType.codeWidth, '0');
        return `${sampleType.codePrefix}${dateStr}${paddedSequence}`;
    }

    async generateCodePreview(generateDto: GenerateCodeDto): Promise<GenerateCodeResponseDto> {
        const targetDate = generateDto.date ? new Date(generateDto.date) : new Date();

        // Tìm SampleType để lấy thông tin cấu hình
        const sampleType = await this.sampleTypeRepository.findByCode(generateDto.sampleTypeCode);
        if (!sampleType) {
            throw AppError.notFound('Sample type not found');
        }

        // Sử dụng logic mới với cấu hình từ Sample Type
        const dateStr = this.formatDateByResetPeriod(targetDate, sampleType.resetPeriod);
        const nextSequence = await this.getNextSequenceNumber(sampleType.id, targetDate, sampleType.resetPeriod);
        const paddedSequence = nextSequence.toString().padStart(sampleType.codeWidth, '0');
        const receptionCode = `${sampleType.codePrefix}${dateStr}${paddedSequence}`;

        return {
            receptionCode,
            sampleTypeCode: generateDto.sampleTypeCode,
            date: dateStr,
            nextSequence,
            codeGenerationConfig: {
                codePrefix: sampleType.codePrefix,
                codeWidth: sampleType.codeWidth,
                allowDuplicate: sampleType.allowDuplicate,
                resetPeriod: sampleType.resetPeriod,
            },
        };
    }

    async getTodayReceptions(): Promise<SampleReceptionResponseDto[]> {
        const receptions = await this.sampleReceptionRepository.findTodayReceptions();
        return receptions.map(r => this.mapReceptionToResponseDto(r));
    }

    async getReceptionsByDateRange(startDate: Date, endDate: Date): Promise<SampleReceptionResponseDto[]> {
        const receptions = await this.sampleReceptionRepository.findByDateRange(startDate, endDate);
        return receptions.map(r => this.mapReceptionToResponseDto(r));
    }

    async getCodeGenerationConfig(sampleTypeId: string): Promise<any> {
        const sampleType = await this.sampleTypeRepository.findById(sampleTypeId);
        if (!sampleType) {
            throw AppError.notFound('Sample type not found');
        }

        return {
            sampleTypeId: sampleType.id,
            sampleTypeCode: sampleType.typeCode,
            sampleTypeName: sampleType.typeName,
            codeGenerationConfig: {
                codePrefix: sampleType.codePrefix,
                codeWidth: sampleType.codeWidth,
                allowDuplicate: sampleType.allowDuplicate,
                resetPeriod: sampleType.resetPeriod,
            },
            examples: {
                daily: this.formatDateByResetPeriod(new Date(), 'DAILY'),
                monthly: this.formatDateByResetPeriod(new Date(), 'MONTHLY'),
                yearly: this.formatDateByResetPeriod(new Date(), 'YEARLY'),
                never: this.formatDateByResetPeriod(new Date(), 'NEVER'),
            },
            currentDate: new Date().toISOString(),
        };
    }

    /**
     * Query sampleTypeId từ receptionCode
     */
    async getSampleTypeByReceptionCode(dto: GetSampleTypeByReceptionCodeDto): Promise<{ sampleTypeId: string | null }> {
        const reception = await this.sampleReceptionRepository.findByCode(dto.receptionCode);
        if (!reception) {
            throw AppError.notFound(`Sample reception với code ${dto.receptionCode} không tìm thấy`);
        }

        return {
            sampleTypeId: reception.sampleTypeId || null,
        };
    }

    // ========== PRIVATE METHODS ==========

    private async getNextSequenceNumber(
        sampleTypeId: string, 
        date?: Date, 
        resetPeriod?: string,
        manager?: any
    ): Promise<number> {
        const targetDate = date || new Date();
        // Use repository method that properly handles sequence number generation based on reset period
        return await this.sampleReceptionRepository.getNextSequenceNumber(sampleTypeId, targetDate, resetPeriod, manager);
    }

    private formatDateByResetPeriod(date: Date, resetPeriod: string): string {
        const year = date.getFullYear().toString().slice(-2); // Lấy 2 số cuối của năm (YY)
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // MM
        const day = date.getDate().toString().padStart(2, '0'); // DD

        switch (resetPeriod) {
            case 'DAILY':
                return `${year}${month}${day}`; // YYMMDD (ví dụ: 251211 cho 11/12/2025)
            case 'MONTHLY':
                return `${year}${month}`; // YYMM (ví dụ: 2512 cho tháng 12/2025)
            case 'YEARLY':
                return year; // YY (ví dụ: 25 cho năm 2025)
            case 'NEVER':
                return ''; // Không có phần ngày
            default:
                return `${year}${month}`; // Default: YYMM
        }
    }

    private mapReceptionToResponseDto(reception: SampleReception): SampleReceptionResponseDto {
        return {
            id: reception.id,
            receptionCode: reception.receptionCode,
            sampleTypeCode: reception.sampleType?.typeCode || '',
            sampleTypeName: reception.sampleType?.typeName || '',
            receptionDate: reception.receptionDate,
            sequenceNumber: reception.sequenceNumber,
            createdAt: reception.createdAt,
            updatedAt: reception.updatedAt,
            createdBy: reception.createdBy,
            updatedBy: reception.updatedBy,
            version: reception.version,
        };
    }
}
