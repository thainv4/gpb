import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SampleReception } from './entities/sample-reception.entity';
import { ISampleReceptionRepository } from './interfaces/sample-reception.repository.interface';
import { CreateSampleReceptionDto } from './dto/commands/create-sample-reception.dto';
import { GetSampleReceptionsDto } from './dto/queries/get-sample-receptions.dto';
import { GenerateCodeDto } from './dto/queries/generate-code.dto';
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

        return this.transactionWithAudit(async (manager) => {
            // 1. Tìm SampleType theo code
            const sampleType = await this.sampleTypeRepository.findByCode(createDto.sampleTypeCode);
            if (!sampleType) {
                throw AppError.notFound('Sample type not found');
            }

            // 2. Sinh mã tiếp nhận với cấu hình từ Sample Type
            const receptionCode = await this.generateReceptionCode(sampleType.typeCode, sampleType.id);

            // 3. Kiểm tra trùng lặp nếu không cho phép
            if (!sampleType.allowDuplicate) {
                const existingReception = await this.sampleReceptionRepository.findByReceptionCode(receptionCode);
                if (existingReception) {
                    throw AppError.conflict('Reception code already exists');
                }
            }

            // 4. Tạo record
            const reception = new SampleReception();
            reception.receptionCode = receptionCode;
            reception.sampleTypeId = sampleType.id;
            reception.receptionDate = new Date();
            reception.sequenceNumber = await this.getNextSequenceNumber(sampleType.id, new Date(), sampleType.resetPeriod);

            reception.createdBy = currentUser.id;
            reception.updatedBy = currentUser.id;

            const savedReception = await manager.save(SampleReception, reception);
            return savedReception.id;
        });
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
        return `${sampleType.codePrefix}${dateStr}.${paddedSequence}`;
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
        const receptionCode = `${sampleType.codePrefix}${dateStr}.${paddedSequence}`;

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

    // ========== PRIVATE METHODS ==========

    private async getNextSequenceNumber(sampleTypeId: string, date?: Date, resetPeriod?: string): Promise<number> {
        const targetDate = date || new Date();
        // Use repository method that properly handles sequence number generation based on reset period
        return await this.sampleReceptionRepository.getNextSequenceNumber(sampleTypeId, targetDate, resetPeriod);
    }

    private formatDateByResetPeriod(date: Date, resetPeriod: string): string {
        switch (resetPeriod) {
            case 'DAILY':
                return date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
            case 'MONTHLY':
                return date.toISOString().slice(0, 7).replace(/-/g, ''); // YYYYMM
            case 'YEARLY':
                return date.toISOString().slice(0, 4); // YYYY
            case 'NEVER':
                return ''; // Không có phần ngày
            default:
                return date.toISOString().slice(0, 7).replace(/-/g, ''); // Default: YYYYMM
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
