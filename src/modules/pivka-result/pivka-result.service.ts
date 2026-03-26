import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { BaseService } from '../../common/services/base.service';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { StoredServiceRequestService } from '../service-request/entities/stored-service-request-service.entity';
import { PivkaResult } from './entities/pivka-result.entity';
import { IPivkaResultRepository } from './interfaces/pivka-result.repository.interface';
import { CreatePivkaIiResultDto } from './dto/commands/create-pivka-ii-result.dto';
import { UpdatePivkaIiResultDto } from './dto/commands/update-pivka-ii-result.dto';
import { GetPivkaIiResultsDto } from './dto/queries/get-pivka-ii-results.dto';
import { PivkaIiResultResponseDto } from './dto/responses/pivka-ii-result-response.dto';
import { PivkaIiResultsListResponseDto } from './dto/responses/pivka-ii-results-list-response.dto';

export interface CurrentUser {
    id: string;
    username: string;
    email: string;
}

@Injectable()
export class PivkaResultService extends BaseService {
    constructor(
        @Inject('IPivkaResultRepository')
        private readonly repo: IPivkaResultRepository,
        @InjectRepository(StoredServiceRequestService)
        private readonly storedSrServiceRepo: Repository<StoredServiceRequestService>,
        @Inject(DataSource)
        protected readonly dataSource: DataSource,
        @Inject(CurrentUserContextService)
        protected readonly currentUserContext: CurrentUserContextService,
    ) {
        super(dataSource, currentUserContext);
    }

    async create(dto: CreatePivkaIiResultDto, currentUser: CurrentUser): Promise<string> {
        // Allow FE to send empty payload
        if (dto.pivkaIiResult === undefined && dto.afpFullResult === undefined && dto.afpL3 === undefined) {
            throw new BadRequestException('At least one result field must be provided');
        }

        this.currentUserContext.setCurrentUser(currentUser);

        const srService = await this.storedSrServiceRepo.findOne({
            where: { id: dto.storedSrServicesId, deletedAt: IsNull() },
        });
        if (!srService) {
            throw new NotFoundException(`Không tìm thấy BML_STORED_SR_SERVICES id='${dto.storedSrServicesId}'`);
        }

        const entity = new PivkaResult();
        entity.storedSrServicesId = dto.storedSrServicesId;
        entity.pivkaIiResult = dto.pivkaIiResult?.trim();
        entity.afpFullResult = dto.afpFullResult?.trim();
        entity.afpL3 = dto.afpL3?.trim();

        this.setAuditFields(entity, false);
        const saved = await this.repo.save(entity);
        return saved.id;
    }

    async update(id: string, dto: UpdatePivkaIiResultDto, currentUser: CurrentUser): Promise<void> {
        this.currentUserContext.setCurrentUser(currentUser);

        const entity = await this.repo.findById(id);
        if (!entity) {
            throw new NotFoundException('Pivka II/AFP result not found');
        }

        if (dto.pivkaIiResult !== undefined) entity.pivkaIiResult = dto.pivkaIiResult?.trim() || null;
        if (dto.afpFullResult !== undefined) entity.afpFullResult = dto.afpFullResult?.trim() || null;
        if (dto.afpL3 !== undefined) entity.afpL3 = dto.afpL3?.trim() || null;

        if (dto.storedSrServicesId !== undefined) {
            const srService = await this.storedSrServiceRepo.findOne({
                where: { id: dto.storedSrServicesId, deletedAt: IsNull() },
            });
            if (!srService) {
                throw new NotFoundException(`Không tìm thấy BML_STORED_SR_SERVICES id='${dto.storedSrServicesId}'`);
            }
            entity.storedSrServicesId = dto.storedSrServicesId;
        }

        this.setAuditFields(entity, true);
        await this.repo.save(entity);
    }

    async delete(id: string, hardDelete: boolean = false, currentUser: CurrentUser): Promise<void> {
        this.currentUserContext.setCurrentUser(currentUser);

        const entity = await this.repo.findById(id);
        if (!entity) {
            throw new NotFoundException('Pivka II/AFP result not found');
        }

        if (hardDelete) {
            await this.repo.delete(id);
            return;
        }

        await this.repo.softDelete(id);
    }

    async getById(id: string): Promise<PivkaIiResultResponseDto> {
        const entity = await this.repo.findById(id);
        if (!entity) {
            throw new NotFoundException('Pivka II/AFP result not found');
        }

        return this.mapToResponse(entity);
    }

    async getAll(query: GetPivkaIiResultsDto): Promise<PivkaIiResultsListResponseDto> {
        const limit = query.limit ?? 10;
        const offset = query.offset ?? 0;
        const sortBy = query.sortBy ?? 'createdAt';
        const sortOrder = query.sortOrder ?? 'DESC';

        const [items, total] = await this.repo.findAllWithPagination(limit, offset, sortBy, sortOrder);
        return {
            items: items.map(x => this.mapToResponse(x)),
            total,
            limit,
            offset,
        };
    }

    private mapToResponse(entity: PivkaResult): PivkaIiResultResponseDto {
        return {
            id: entity.id,
            storedSrServicesId: entity.storedSrServicesId,
            pivkaIiResult: entity.pivkaIiResult ?? null,
            afpFullResult: entity.afpFullResult ?? null,
            afpL3: entity.afpL3 ?? null,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            deletedAt: entity.deletedAt ?? null,
            createdBy: entity.createdBy ?? null,
            updatedBy: entity.updatedBy ?? null,
            version: entity.version,
        };
    }
}

