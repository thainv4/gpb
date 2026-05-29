import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseService } from '../../common/services/base.service';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { AppError } from '../../common/errors/app.error';
import { CurrentUser } from '../../common/interfaces/current-user.interface';
import { SampleRejection } from './entities/sample-rejection.entity';
import { ISampleRejectionRepository } from './interfaces/sample-rejection.repository.interface';
import { CreateSampleRejectionDto } from './dto/commands/create-sample-rejection.dto';
import { UpdateSampleRejectionDto } from './dto/commands/update-sample-rejection.dto';
import { GetSampleRejectionsDto } from './dto/queries/get-sample-rejections.dto';
import { SampleRejectionResponseDto } from './dto/responses/sample-rejection-response.dto';

export interface GetSampleRejectionsResult {
    sampleRejections: SampleRejectionResponseDto[];
    total: number;
    limit: number;
    offset: number;
}

@Injectable()
export class SampleRejectionService extends BaseService {
    constructor(
        @Inject('ISampleRejectionRepository')
        private readonly sampleRejectionRepository: ISampleRejectionRepository,
        @Inject(DataSource)
        protected readonly dataSource: DataSource,
        @Inject(CurrentUserContextService)
        protected readonly currentUserContext: CurrentUserContextService,
    ) {
        super(dataSource, currentUserContext);
    }

    async create(createDto: CreateSampleRejectionDto, currentUser: CurrentUser): Promise<string> {
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async manager => {
            const entity = new SampleRejection();
            Object.assign(entity, this.buildEntityFromDto(createDto));
            this.setAuditFields(entity, false);

            const saved = await manager.save(SampleRejection, entity);
            return saved.id;
        });
    }

    async update(id: string, updateDto: UpdateSampleRejectionDto, currentUser: CurrentUser): Promise<void> {
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async manager => {
            const existing = await this.sampleRejectionRepository.findById(id);
            if (!existing) {
                throw AppError.notFound('Sample rejection not found');
            }

            Object.assign(existing, this.buildEntityFromDto(updateDto));
            existing.updatedBy = currentUser.id;

            await manager.save(SampleRejection, existing);
        });
    }

    async delete(id: string): Promise<void> {
        const existing = await this.sampleRejectionRepository.findById(id);
        if (!existing) {
            throw AppError.notFound('Sample rejection not found');
        }

        await this.sampleRejectionRepository.delete(id);
    }

    async getById(id: string): Promise<SampleRejectionResponseDto> {
        const entity = await this.sampleRejectionRepository.findById(id);
        if (!entity) {
            throw AppError.notFound('Sample rejection not found');
        }

        return this.mapToResponse(entity);
    }

    async getList(query: GetSampleRejectionsDto): Promise<GetSampleRejectionsResult> {
        const { limit = 10, offset = 0, search } = query;
        const [entities, total] = await this.sampleRejectionRepository.findWithPagination(limit, offset, search);

        return {
            sampleRejections: entities.map(e => this.mapToResponse(e)),
            total,
            limit,
            offset,
        };
    }

    private buildEntityFromDto(dto: CreateSampleRejectionDto): Partial<SampleRejection> {
        return {
            patientName: dto.patientName.trim(),
            dateOfBirth: new Date(dto.dateOfBirth),
            gender: dto.gender,
            diagnosis: dto.diagnosis.trim(),
            testIndication: dto.testIndication.trim(),
            orderingDoctor: dto.orderingDoctor.trim(),
            patientAddress: dto.patientAddress.trim(),
            sampleCode: dto.sampleCode.trim(),
            samplingSite: dto.samplingSite.trim(),
            samplingMethod: dto.samplingMethod.trim(),
            rejectionTime: new Date(dto.rejectionTime),
            rejectionReason: dto.rejectionReason.trim(),
        };
    }

    private formatDateOnly(date: Date): string {
        const d = new Date(date);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }

    private mapToResponse(entity: SampleRejection): SampleRejectionResponseDto {
        return {
            id: entity.id,
            patientName: entity.patientName,
            dateOfBirth: this.formatDateOnly(entity.dateOfBirth),
            gender: entity.gender,
            diagnosis: entity.diagnosis,
            testIndication: entity.testIndication,
            orderingDoctor: entity.orderingDoctor,
            patientAddress: entity.patientAddress,
            sampleCode: entity.sampleCode,
            samplingSite: entity.samplingSite,
            samplingMethod: entity.samplingMethod,
            rejectionTime: entity.rejectionTime,
            rejectionReason: entity.rejectionReason,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            createdBy: entity.createdBy ?? null,
            updatedBy: entity.updatedBy ?? null,
            version: entity.version,
        };
    }
}
