import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IUnitOfMeasureRepository } from './interfaces/unit-of-measure.repository.interface';
import { CreateUnitOfMeasureDto } from './dto/commands/create-unit-of-measure.dto';
import { UpdateUnitOfMeasureDto } from './dto/commands/update-unit-of-measure.dto';
import { GetUnitsOfMeasureDto } from './dto/queries/get-units-of-measure.dto';
import { UnitOfMeasure } from './entities/unit-of-measure.entity';
import { UnitOfMeasureResponseDto, GetUnitsOfMeasureResult } from './dto/responses/unit-of-measure-response.dto';

@Injectable()
export class UnitOfMeasureService {
    constructor(
        @Inject('IUnitOfMeasureRepository')
        private readonly repo: IUnitOfMeasureRepository,
        private readonly dataSource: DataSource,
    ) { }

    // CREATE
    async create(dto: CreateUnitOfMeasureDto): Promise<string> {
        const exists = await this.repo.findByCode(dto.unitOfMeasureCode);
        if (exists) {
            throw new ConflictException('UnitOfMeasure code already exists');
        }
        const entity = new UnitOfMeasure();
        entity.unitOfMeasureCode = dto.unitOfMeasureCode.trim();
        entity.unitOfMeasureName = dto.unitOfMeasureName.trim();
        entity.description = dto.description?.trim();
        entity.mapping = dto.mapping ?? null;
        const saved = await this.repo.save(entity);
        return saved.id;
    }

    // UPDATE
    async update(id: string, dto: UpdateUnitOfMeasureDto): Promise<void> {
        const entity = await this.repo.findById(id);
        if (!entity) throw new NotFoundException('UnitOfMeasure not found');
        if (dto.unitOfMeasureName !== undefined) entity.unitOfMeasureName = dto.unitOfMeasureName.trim();
        if (dto.description !== undefined) entity.description = dto.description?.trim();
        if (dto.mapping !== undefined) entity.mapping = dto.mapping ?? null;
        await this.repo.save(entity);
    }

    // DELETE
    async delete(id: string): Promise<void> {
        const entity = await this.repo.findById(id);
        if (!entity) throw new NotFoundException('UnitOfMeasure not found');
        await this.repo.remove(id);
    }

    // GET ONE
    async getById(id: string): Promise<UnitOfMeasureResponseDto> {
        const entity = await this.repo.findById(id);
        if (!entity) throw new NotFoundException('UnitOfMeasure not found');
        return this.map(entity);
    }

    // LIST
    async getAll(query: GetUnitsOfMeasureDto): Promise<GetUnitsOfMeasureResult> {
        const { items, total } = await this.repo.findAll(query);
        return {
            items: items.map(x => this.map(x)),
            total,
            limit: query.limit ?? 10,
            offset: query.offset ?? 0,
        };
    }

    private map(x: UnitOfMeasure): UnitOfMeasureResponseDto {
        return {
            id: x.id,
            unitOfMeasureCode: x.unitOfMeasureCode,
            unitOfMeasureName: x.unitOfMeasureName,
            description: x.description,
            mapping: x.mapping ?? null,
        };
    }
}


