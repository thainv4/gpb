import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import { UnitOfMeasure } from './entities/unit-of-measure.entity';
import { IUnitOfMeasureRepository } from './interfaces/unit-of-measure.repository.interface';
import { GetUnitsOfMeasureDto } from './dto/queries/get-units-of-measure.dto';

@Injectable()
export class UnitOfMeasureRepository implements IUnitOfMeasureRepository {
    constructor(
        @InjectRepository(UnitOfMeasure)
        private readonly repo: Repository<UnitOfMeasure>,
    ) { }

    async findById(id: string): Promise<UnitOfMeasure | null> {
        return this.repo.findOne({ where: { id } });
    }

    async findByIds(ids: string[]): Promise<UnitOfMeasure[]> {
        if (!ids || ids.length === 0) return [];
        return this.repo.find({ where: { id: In(ids) } });
    }

    async findByCode(code: string): Promise<UnitOfMeasure | null> {
        return this.repo.findOne({ where: { unitOfMeasureCode: code } });
    }

    async findAll(query: GetUnitsOfMeasureDto): Promise<{ items: UnitOfMeasure[]; total: number }> {
        const where: any = {};
        if (query.code) where.unitOfMeasureCode = ILike(`%${query.code}%`);
        if (query.name) where.unitOfMeasureName = ILike(`%${query.name}%`);

        const [items, total] = await this.repo.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            take: query.limit ?? 10,
            skip: query.offset ?? 0,
        });
        return { items, total };
    }

    async save(entity: UnitOfMeasure): Promise<UnitOfMeasure> {
        return this.repo.save(entity);
    }

    async remove(id: string): Promise<void> {
        await this.repo.softDelete(id);
    }
}


