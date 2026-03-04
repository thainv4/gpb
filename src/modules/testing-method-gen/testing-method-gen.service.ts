import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseService } from '../../common/services/base.service';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { AppError } from '../../common/errors/app.error';
import { CurrentUser } from '../../common/interfaces/current-user.interface';
import { TestingMethodGen } from './entities/testing-method-gen.entity';
import { ITestingMethodGenRepository } from './interfaces/testing-method-gen.repository.interface';
import { CreateTestingMethodGenDto } from './dto/commands/create-testing-method-gen.dto';
import { UpdateTestingMethodGenDto } from './dto/commands/update-testing-method-gen.dto';
import { GetTestingMethodsGenDto } from './dto/queries/get-testing-methods-gen.dto';
import { TestingMethodGenResponseDto } from './dto/responses/testing-method-gen-response.dto';

export interface GetTestingMethodsGenResult {
    testingMethodsGen: TestingMethodGenResponseDto[];
    total: number;
    limit: number;
    offset: number;
}

@Injectable()
export class TestingMethodGenService extends BaseService {
    constructor(
        @Inject('ITestingMethodGenRepository')
        private readonly testingMethodGenRepository: ITestingMethodGenRepository,
        @Inject(DataSource)
        protected readonly dataSource: DataSource,
        @Inject(CurrentUserContextService)
        protected readonly currentUserContext: CurrentUserContextService,
    ) {
        super(dataSource, currentUserContext);
    }

    async create(dto: CreateTestingMethodGenDto, currentUser: CurrentUser): Promise<string> {
        this.currentUserContext.setCurrentUser(currentUser);

        const exists = await this.testingMethodGenRepository.existsByName(dto.methodName);
        if (exists) {
            throw AppError.conflict('Testing method gen already exists');
        }

        return this.transactionWithAudit(async (manager) => {
            const entity = new TestingMethodGen();
            entity.methodName = dto.methodName.trim();
            this.setAuditFields(entity, false);

            const saved = await manager.save(TestingMethodGen, entity);
            return saved.id;
        });
    }

    async update(id: string, dto: UpdateTestingMethodGenDto, currentUser: CurrentUser): Promise<void> {
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            const existing = await this.testingMethodGenRepository.findById(id);
            if (!existing) {
                throw AppError.notFound('Testing method gen not found');
            }

            if (dto.methodName !== undefined && dto.methodName !== existing.methodName) {
                const duplicated = await this.testingMethodGenRepository.existsByName(dto.methodName);
                if (duplicated) {
                    throw AppError.conflict('Testing method gen with this name already exists');
                }
            }

            Object.assign(existing, {
                methodName: dto.methodName ?? existing.methodName,
                updatedBy: currentUser.id,
            });

            await manager.save(TestingMethodGen, existing);
        });
    }

    async delete(id: string): Promise<void> {
        const existing = await this.testingMethodGenRepository.findById(id);
        if (!existing) {
            throw AppError.notFound('Testing method gen not found');
        }
        await this.testingMethodGenRepository.delete(id);
    }

    async getById(id: string): Promise<TestingMethodGenResponseDto> {
        const entity = await this.testingMethodGenRepository.findById(id);
        if (!entity) {
            throw AppError.notFound('Testing method gen not found');
        }
        return this.mapToResponse(entity);
    }

    async getByMethodName(methodName: string): Promise<TestingMethodGenResponseDto> {
        const entity = await this.testingMethodGenRepository.findByMethodName(methodName);
        if (!entity) {
            throw AppError.notFound('Testing method gen not found');
        }
        return this.mapToResponse(entity);
    }

    async getList(query: GetTestingMethodsGenDto): Promise<GetTestingMethodsGenResult> {
        const { limit = 10, offset = 0, search } = query;
        const [entities, total] = await this.testingMethodGenRepository.findWithPagination(
            limit,
            offset,
            search,
        );

        return {
            testingMethodsGen: entities.map((e) => this.mapToResponse(e)),
            total,
            limit,
            offset,
        };
    }

    private mapToResponse(entity: TestingMethodGen): TestingMethodGenResponseDto {
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
