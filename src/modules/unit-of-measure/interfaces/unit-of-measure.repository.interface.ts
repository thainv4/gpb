import { UnitOfMeasure } from '../entities/unit-of-measure.entity';
import { GetUnitsOfMeasureDto } from '../dto/queries/get-units-of-measure.dto';

export interface IUnitOfMeasureRepository {
    findById(id: string): Promise<UnitOfMeasure | null>;
    findByIds(ids: string[]): Promise<UnitOfMeasure[]>;
    findByCode(code: string): Promise<UnitOfMeasure | null>;
    findAll(query: GetUnitsOfMeasureDto): Promise<{ items: UnitOfMeasure[]; total: number }>;
    save(entity: UnitOfMeasure): Promise<UnitOfMeasure>;
    remove(id: string): Promise<void>;
}


