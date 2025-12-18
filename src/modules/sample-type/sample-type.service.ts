import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SampleType } from './entities/sample-type.entity';
import { ISampleTypeRepository } from './interfaces/sample-type.repository.interface';
import { CreateSampleTypeDto } from './dto/commands/create-sample-type.dto';
import { UpdateSampleTypeDto } from './dto/commands/update-sample-type.dto';
import { GetSampleTypesDto } from './dto/queries/get-sample-types.dto';
import { SampleTypeResponseDto } from './dto/responses/sample-type-response.dto';
import { DataLoaderService } from '../../shared/dataloaders/dataloader.service';
import { AppError } from '../../common/errors/app.error';
import { BaseService } from '../../common/services/base.service';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { CurrentUser } from '../../common/interfaces/current-user.interface';

export interface GetSampleTypesResult {
    sampleTypes: SampleTypeResponseDto[];
    total: number;
    limit: number;
    offset: number;
}

@Injectable()
export class SampleTypeService extends BaseService {
    constructor(
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

    async createSampleType(createDto: CreateSampleTypeDto, currentUser: CurrentUser): Promise<string> {
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            // Check if type code already exists
            const existingByCode = await this.sampleTypeRepository.existsByCode(createDto.typeCode);
            if (existingByCode) {
                throw AppError.conflict('Sample type with this code already exists');
            }

            // Check if type name already exists
            const existingByName = await this.sampleTypeRepository.existsByName(createDto.typeName);
            if (existingByName) {
                throw AppError.conflict('Sample type with this name already exists');
            }

            const sampleType = new SampleType();
            sampleType.typeCode = createDto.typeCode;
            sampleType.typeName = createDto.typeName;
            sampleType.shortName = createDto.shortName;
            sampleType.description = createDto.description;
            sampleType.sortOrder = createDto.sortOrder || await this.sampleTypeRepository.getNextSortOrder();
            sampleType.codePrefix = createDto.codePrefix;
            sampleType.codeWidth = createDto.codeWidth || 4;
            sampleType.allowDuplicate = createDto.allowDuplicate || false;
            sampleType.resetPeriod = createDto.resetPeriod || 'MONTHLY';

            sampleType.createdBy = currentUser.id;
            sampleType.updatedBy = currentUser.id;

            const savedSampleType = await manager.save(SampleType, sampleType);
            return savedSampleType.id;
        });
    }

    async updateSampleType(id: string, updateDto: UpdateSampleTypeDto, currentUser: CurrentUser): Promise<void> {
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            const sampleType = await this.sampleTypeRepository.findById(id);
            if (!sampleType) {
                throw AppError.notFound('Sample type not found');
            }

            // Check for conflicts if updating code or name
            if (updateDto.typeCode && updateDto.typeCode !== sampleType.typeCode) {
                const existingByCode = await this.sampleTypeRepository.existsByCode(updateDto.typeCode);
                if (existingByCode) {
                    throw AppError.conflict('Sample type with this code already exists');
                }
            }

            if (updateDto.typeName && updateDto.typeName !== sampleType.typeName) {
                const existingByName = await this.sampleTypeRepository.existsByName(updateDto.typeName);
                if (existingByName) {
                    throw AppError.conflict('Sample type with this name already exists');
                }
            }

            // Update fields
            Object.assign(sampleType, updateDto);
            sampleType.updatedBy = currentUser.id;

            await manager.save(SampleType, sampleType);
        });
    }

    async deleteSampleType(id: string): Promise<void> {
        return this.transactionWithAudit(async (manager) => {
            const sampleType = await this.sampleTypeRepository.findById(id);
            if (!sampleType) {
                throw AppError.notFound('Sample type not found');
            }

            await this.sampleTypeRepository.delete(id);
        });
    }

    // ========== QUERIES (Read Operations) ==========

    async getSampleTypeById(id: string): Promise<SampleTypeResponseDto> {
        const sampleType = await this.sampleTypeRepository.findById(id);
        if (!sampleType) {
            throw AppError.notFound('Sample type not found');
        }

        return this.mapSampleTypeToResponseDto(sampleType);
    }

    async getSampleTypes(query: GetSampleTypesDto): Promise<GetSampleTypesResult> {
        const { limit = 10, offset = 0, search } = query;

        const [sampleTypes, total] = await this.sampleTypeRepository.findWithPagination(
            limit,
            offset,
            search
        );

        return {
            sampleTypes: sampleTypes.map(st => this.mapSampleTypeToResponseDto(st)),
            total,
            limit,
            offset,
        };
    }

    async searchSampleTypes(searchTerm: string): Promise<SampleTypeResponseDto[]> {
        const [sampleTypes] = await this.sampleTypeRepository.findWithPagination(
            100, // Large limit for search
            0,
            searchTerm
        );

        return sampleTypes.map(st => this.mapSampleTypeToResponseDto(st));
    }

    async getActiveSampleTypes(): Promise<SampleTypeResponseDto[]> {
        const sampleTypes = await this.sampleTypeRepository.findActiveWithSorting();
        return sampleTypes.map(st => this.mapSampleTypeToResponseDto(st));
    }

    // ========== PRIVATE METHODS ==========

    private mapSampleTypeToResponseDto(sampleType: SampleType): SampleTypeResponseDto {
        return {
            id: sampleType.id,
            typeCode: sampleType.typeCode,
            typeName: sampleType.typeName,
            shortName: sampleType.shortName,
            description: sampleType.description,
            sortOrder: sampleType.sortOrder,
            codePrefix: sampleType.codePrefix,
            codeWidth: sampleType.codeWidth,
            allowDuplicate: sampleType.allowDuplicate,
            resetPeriod: sampleType.resetPeriod,
            displayName: sampleType.getDisplayName(),
            codeGenerationInfo: sampleType.getCodeGenerationInfo(),
            createdAt: sampleType.createdAt,
            updatedAt: sampleType.updatedAt,
            createdBy: sampleType.createdBy,
            updatedBy: sampleType.updatedBy,
            version: sampleType.version,
        };
    }
}
