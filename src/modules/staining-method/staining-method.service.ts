import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseService } from '../../common/services/base.service';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { AppError } from '../../common/errors/app.error';
import { CurrentUser } from '../../common/interfaces/current-user.interface';
import { StainingMethod } from '../service-request/entities/staining-method.entity';
import { IStainingMethodRepository } from './interfaces/staining-method.repository.interface';
import { CreateStainingMethodDto } from './dto/commands/create-staining-method.dto';
import { UpdateStainingMethodDto } from './dto/commands/update-staining-method.dto';
import { GetStainingMethodsDto } from './dto/queries/get-staining-methods.dto';
import { StainingMethodResponseDto } from './dto/responses/staining-method-response.dto';

export interface GetStainingMethodsResult {
    stainingMethods: StainingMethodResponseDto[];
    total: number;
    limit: number;
    offset: number;
}

@Injectable()
export class StainingMethodService extends BaseService {
    constructor(
        @Inject('IStainingMethodRepository')
        private readonly stainingMethodRepository: IStainingMethodRepository,
        @Inject(DataSource)
        protected readonly dataSource: DataSource,
        @Inject(CurrentUserContextService)
        protected readonly currentUserContext: CurrentUserContextService,
    ) {
        super(dataSource, currentUserContext);
    }

    async create(createDto: CreateStainingMethodDto, currentUser: CurrentUser): Promise<string> {
        this.currentUserContext.setCurrentUser(currentUser);

        const exists = await this.stainingMethodRepository.existsByName(createDto.methodName);
        if (exists) {
            throw AppError.conflict('Staining method already exists');
        }

        return this.transactionWithAudit(async manager => {
            const entity = new StainingMethod();
            entity.methodName = createDto.methodName.trim();
            this.setAuditFields(entity, false);

            const saved = await manager.save(StainingMethod, entity);
            return saved.id;
        });
    }

    async update(id: string, updateDto: UpdateStainingMethodDto, currentUser: CurrentUser): Promise<void> {
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async manager => {
            const existing = await this.stainingMethodRepository.findById(id);
            if (!existing) {
                throw AppError.notFound('Staining method not found');
            }

            if (updateDto.methodName && updateDto.methodName !== existing.methodName) {
                const duplicated = await this.stainingMethodRepository.existsByName(updateDto.methodName);
                if (duplicated) {
                    throw AppError.conflict('Staining method with this name already exists');
                }
            }

            Object.assign(existing, {
                methodName: updateDto.methodName ?? existing.methodName,
                updatedBy: currentUser.id,
            });

            await manager.save(StainingMethod, existing);
        });
    }

    async delete(id: string): Promise<void> {
        const existing = await this.stainingMethodRepository.findById(id);
        if (!existing) {
            throw AppError.notFound('Staining method not found');
        }

        await this.stainingMethodRepository.delete(id);
    }

    async getById(id: string): Promise<StainingMethodResponseDto> {
        const entity = await this.stainingMethodRepository.findById(id);
        if (!entity) {
            throw AppError.notFound('Staining method not found');
        }

        return this.mapToResponse(entity);
    }

    async getList(query: GetStainingMethodsDto): Promise<GetStainingMethodsResult> {
        const { limit = 10, offset = 0, search } = query;
        const [entities, total] = await this.stainingMethodRepository.findWithPagination(limit, offset, search);

        return {
            stainingMethods: entities.map(e => this.mapToResponse(e)),
            total,
            limit,
            offset,
        };
    }

    private mapToResponse(entity: StainingMethod): StainingMethodResponseDto {
        return {
            id: entity.id,
            methodName: entity.methodName,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            createdBy: entity.createdBy ?? null,
            updatedBy: entity.updatedBy ?? null,
            version: entity.version,
        };
    }
}
