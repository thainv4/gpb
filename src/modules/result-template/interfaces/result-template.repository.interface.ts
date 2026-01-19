import { ResultTemplate } from '../entities/result-template.entity';

export interface IResultTemplateRepository {
    // ========== BASIC CRUD OPERATIONS ==========
    findById(id: string): Promise<ResultTemplate | null>;
    findByTemplate(template: string): Promise<ResultTemplate | null>;
    save(resultTemplate: ResultTemplate): Promise<ResultTemplate>;
    delete(id: string): Promise<void>;
    softDelete(id: string): Promise<void>;

    // ========== QUERY OPERATIONS ==========
    findAll(): Promise<ResultTemplate[]>;

    // ========== SEARCH OPERATIONS ==========
    searchByKeyword(keyword: string): Promise<ResultTemplate[]>;

    // ========== PAGINATION OPERATIONS ==========
    findWithPagination(
        limit: number,
        offset: number,
        sortBy?: string,
        sortOrder?: 'ASC' | 'DESC'
    ): Promise<{ data: ResultTemplate[]; total: number }>;

    searchWithPagination(
        keyword: string,
        limit: number,
        offset: number,
        sortBy?: string,
        sortOrder?: 'ASC' | 'DESC'
    ): Promise<{ data: ResultTemplate[]; total: number }>;

    // ========== EXISTENCE CHECK OPERATIONS ==========
    existsByTemplate(template: string, excludeId?: string): Promise<boolean>;
    existsByCode(resultTemplateCode: string, excludeId?: string): Promise<boolean>;
    findByCode(resultTemplateCode: string): Promise<ResultTemplate | null>;
}

