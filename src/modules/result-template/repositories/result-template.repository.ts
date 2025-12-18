import { Injectable } from '@nestjs/common';
import { Repository, IsNull } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ResultTemplate } from '../entities/result-template.entity';
import { IResultTemplateRepository } from '../interfaces/result-template.repository.interface';

@Injectable()
export class ResultTemplateRepository implements IResultTemplateRepository {
    constructor(
        @InjectRepository(ResultTemplate)
        private readonly resultTemplateRepository: Repository<ResultTemplate>,
    ) { }

    // ========== BASIC CRUD OPERATIONS ==========
    async findById(id: string): Promise<ResultTemplate | null> {
        return this.resultTemplateRepository.findOne({
            where: { id, deletedAt: IsNull() },
        });
    }

    async findByTemplate(template: string): Promise<ResultTemplate | null> {
        // Cannot use direct comparison with CLOB in Oracle
        // Use query builder with DBMS_LOB.COMPARE
        return this.resultTemplateRepository
            .createQueryBuilder('resultTemplate')
            .where('DBMS_LOB.COMPARE(resultTemplate.resultTextTemplate, :template) = 0', { template })
            .andWhere('resultTemplate.deletedAt IS NULL')
            .getOne();
    }

    async save(resultTemplate: ResultTemplate): Promise<ResultTemplate> {
        return this.resultTemplateRepository.save(resultTemplate);
    }

    async delete(id: string): Promise<void> {
        await this.resultTemplateRepository.delete(id);
    }

    async softDelete(id: string): Promise<void> {
        await this.resultTemplateRepository.update(id, {
            deletedAt: new Date(),
        });
    }

    // ========== QUERY OPERATIONS ==========
    async findAll(): Promise<ResultTemplate[]> {
        return this.resultTemplateRepository.find({
            where: { deletedAt: IsNull() },
            order: { createdAt: 'DESC' },
        });
    }

    // ========== SEARCH OPERATIONS ==========
    async searchByKeyword(keyword: string): Promise<ResultTemplate[]> {
        // Search in both templateName and resultTextTemplate
        // Use LIKE for templateName (NVARCHAR2) and DBMS_LOB.INSTR for CLOB
        return this.resultTemplateRepository
            .createQueryBuilder('resultTemplate')
            .where('(UPPER(resultTemplate.templateName) LIKE UPPER(:keyword) OR DBMS_LOB.INSTR(resultTemplate.resultTextTemplate, :keyword) > 0)', { keyword: `%${keyword}%` })
            .andWhere('resultTemplate.deletedAt IS NULL')
            .orderBy('resultTemplate.createdAt', 'DESC')
            .getMany();
    }

    // ========== PAGINATION OPERATIONS ==========
    async findWithPagination(
        limit: number,
        offset: number,
        sortBy: string = 'createdAt',
        sortOrder: 'ASC' | 'DESC' = 'DESC'
    ): Promise<{ data: ResultTemplate[]; total: number }> {
        const [data, total] = await this.resultTemplateRepository.findAndCount({
            where: { deletedAt: IsNull() },
            order: { [sortBy]: sortOrder },
            take: limit,
            skip: offset,
        });

        return { data, total };
    }

    async searchWithPagination(
        keyword: string,
        limit: number,
        offset: number,
        sortBy: string = 'createdAt',
        sortOrder: 'ASC' | 'DESC' = 'DESC'
    ): Promise<{ data: ResultTemplate[]; total: number }> {
        // Search in both templateName and resultTextTemplate
        // Use LIKE for templateName (NVARCHAR2) and DBMS_LOB.INSTR for CLOB
        const queryBuilder = this.resultTemplateRepository
            .createQueryBuilder('resultTemplate')
            .where('(UPPER(resultTemplate.templateName) LIKE UPPER(:keyword) OR DBMS_LOB.INSTR(resultTemplate.resultTextTemplate, :keyword) > 0)', { keyword: `%${keyword}%` })
            .andWhere('resultTemplate.deletedAt IS NULL')
            .orderBy(`resultTemplate.${sortBy}`, sortOrder)
            .take(limit)
            .skip(offset);

        const [data, total] = await queryBuilder.getManyAndCount();

        return { data, total };
    }

    // ========== EXISTENCE CHECK OPERATIONS ==========
    async existsByTemplate(template: string, excludeId?: string): Promise<boolean> {
        // Cannot use direct comparison with CLOB in Oracle
        // Use query builder with DBMS_LOB.COMPARE
        const queryBuilder = this.resultTemplateRepository
            .createQueryBuilder('resultTemplate')
            .where('DBMS_LOB.COMPARE(resultTemplate.resultTextTemplate, :template) = 0', { template })
            .andWhere('resultTemplate.deletedAt IS NULL');

        if (excludeId) {
            queryBuilder.andWhere('resultTemplate.id != :excludeId', { excludeId });
        }

        const count = await queryBuilder.getCount();
        return count > 0;
    }
}

