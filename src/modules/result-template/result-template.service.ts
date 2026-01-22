import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IResultTemplateRepository } from './interfaces/result-template.repository.interface';
import { ResultTemplate } from './entities/result-template.entity';
import { CreateResultTemplateDto } from './dto/commands/create-result-template.dto';
import { UpdateResultTemplateDto } from './dto/commands/update-result-template.dto';
import { GetResultTemplatesDto } from './dto/queries/get-result-templates.dto';
import { SearchResultTemplatesDto } from './dto/queries/search-result-templates.dto';
import { ResultTemplateResponseDto } from './dto/responses/result-template-response.dto';
import { ResultTemplatesListResponseDto } from './dto/responses/result-templates-list-response.dto';
import { BaseService } from '../../common/services/base.service';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { AppError } from '../../common/errors/app.error';

export interface CurrentUser {
    id: string;
    username: string;
    email: string;
}

@Injectable()
export class ResultTemplateService extends BaseService {
    constructor(
        @Inject('IResultTemplateRepository')
        private readonly resultTemplateRepository: IResultTemplateRepository,
        @Inject(DataSource)
        protected readonly dataSource: DataSource,
        @Inject(CurrentUserContextService)
        protected readonly currentUserContext: CurrentUserContextService,
    ) {
        super(dataSource, currentUserContext);
    }

    // ============================================================================================================
    // COMMANDS (WRITE OPERATIONS)
    // ============================================================================================================

    async createResultTemplate(
        createResultTemplateDto: CreateResultTemplateDto,
        currentUser: CurrentUser
    ): Promise<ResultTemplateResponseDto> {
        // Set current user context for automatic audit
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            // Check if result template code already exists
            const existingByCode = await this.resultTemplateRepository.existsByCode(createResultTemplateDto.resultTemplateCode);
            if (existingByCode) {
                throw AppError.conflict(`Mẫu kết quả với mã '${createResultTemplateDto.resultTemplateCode}' đã tồn tại`);
            }

            // Create result template
            const resultTemplate = new ResultTemplate();
            resultTemplate.resultTemplateCode = createResultTemplateDto.resultTemplateCode;
            resultTemplate.templateName = createResultTemplateDto.templateName;
            resultTemplate.resultDescription = createResultTemplateDto.resultDescription;
            resultTemplate.resultConclude = createResultTemplateDto.resultConclude;
            resultTemplate.resultNote = createResultTemplateDto.resultNote;
            resultTemplate.resultComment = createResultTemplateDto.resultComment;

            // ✅ Manual audit fields assignment
            const now = new Date();
            resultTemplate.createdAt = now;
            resultTemplate.updatedAt = now;
            resultTemplate.createdBy = currentUser.id;
            resultTemplate.updatedBy = currentUser.id;

            const savedTemplate = await manager.save(ResultTemplate, resultTemplate);
            return this.mapResultTemplateToResponseDto(savedTemplate);
        });
    }

    async updateResultTemplate(
        id: string,
        updateResultTemplateDto: UpdateResultTemplateDto,
        currentUser: CurrentUser
    ): Promise<void> {
        // Set current user context for automatic audit
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            const resultTemplate = await this.resultTemplateRepository.findById(id);
            if (!resultTemplate) {
                throw AppError.notFound('Result template', id);
            }

            // Update result template fields
            if (updateResultTemplateDto.resultTemplateCode !== undefined) {
                // Check if new code already exists (excluding current record)
                const existingByCode = await this.resultTemplateRepository.existsByCode(
                    updateResultTemplateDto.resultTemplateCode,
                    id
                );
                if (existingByCode) {
                    throw AppError.conflict(`Mẫu kết quả với mã '${updateResultTemplateDto.resultTemplateCode}' đã tồn tại`);
                }
                resultTemplate.resultTemplateCode = updateResultTemplateDto.resultTemplateCode;
            }
            if (updateResultTemplateDto.templateName !== undefined) {
                resultTemplate.templateName = updateResultTemplateDto.templateName;
            }
            if (updateResultTemplateDto.resultDescription !== undefined) {
                resultTemplate.resultDescription = updateResultTemplateDto.resultDescription;
            }
            if (updateResultTemplateDto.resultConclude !== undefined) {
                resultTemplate.resultConclude = updateResultTemplateDto.resultConclude;
            }
            if (updateResultTemplateDto.resultNote !== undefined) {
                resultTemplate.resultNote = updateResultTemplateDto.resultNote;
            }
            if (updateResultTemplateDto.resultComment !== undefined) {
                resultTemplate.resultComment = updateResultTemplateDto.resultComment;
            }

            // ✅ Automatic audit fields - no manual assignment needed!
            this.setAuditFields(resultTemplate, true); // true = update operation

            await manager.save(ResultTemplate, resultTemplate);
        });
    }

    async deleteResultTemplate(id: string): Promise<void> {
        const resultTemplate = await this.resultTemplateRepository.findById(id);
        if (!resultTemplate) {
            throw AppError.notFound('Result template', id);
        }

        await this.resultTemplateRepository.softDelete(id);
    }

    // ============================================================================================================
    // QUERIES (READ OPERATIONS)
    // ============================================================================================================

    async getResultTemplateById(id: string): Promise<ResultTemplateResponseDto> {
        const resultTemplate = await this.resultTemplateRepository.findById(id);
        if (!resultTemplate) {
            throw AppError.notFound('Result template', id);
        }
        return this.mapResultTemplateToResponseDto(resultTemplate);
    }

    async getAllResultTemplates(
        getResultTemplatesDto: GetResultTemplatesDto
    ): Promise<ResultTemplatesListResponseDto> {
        const { limit, offset, sortBy, sortOrder } = getResultTemplatesDto;

        const { data, total } = await this.resultTemplateRepository.findWithPagination(
            limit,
            offset,
            sortBy,
            sortOrder
        );

        return {
            data: data.map(template => this.mapResultTemplateToResponseDto(template)),
            total,
            limit,
            offset,
        };
    }

    async searchResultTemplates(
        searchResultTemplatesDto: SearchResultTemplatesDto
    ): Promise<ResultTemplatesListResponseDto> {
        const { keyword, limit, offset, sortBy, sortOrder } = searchResultTemplatesDto;

        if (!keyword) {
            // If no keyword, return all with pagination
            return this.getAllResultTemplates({
                limit,
                offset,
                sortBy,
                sortOrder,
            });
        }

        const { data, total } = await this.resultTemplateRepository.searchWithPagination(
            keyword,
            limit,
            offset,
            sortBy,
            sortOrder
        );

        return {
            data: data.map(template => this.mapResultTemplateToResponseDto(template)),
            total,
            limit,
            offset,
        };
    }

    // ============================================================================================================
    // HELPER METHODS
    // ============================================================================================================

    private mapResultTemplateToResponseDto(resultTemplate: ResultTemplate): ResultTemplateResponseDto {
        return {
            id: resultTemplate.id,
            resultTemplateCode: resultTemplate.resultTemplateCode,
            templateName: resultTemplate.templateName,
            resultDescription: resultTemplate.resultDescription ?? undefined,
            resultConclude: resultTemplate.resultConclude ?? undefined,
            resultNote: resultTemplate.resultNote ?? undefined,
            resultComment: resultTemplate.resultComment ?? undefined,
            createdAt: resultTemplate.createdAt,
            updatedAt: resultTemplate.updatedAt,
            createdBy: resultTemplate.createdBy,
            updatedBy: resultTemplate.updatedBy,
        };
    }
}

