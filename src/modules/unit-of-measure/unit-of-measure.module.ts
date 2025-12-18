import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitOfMeasure } from './entities/unit-of-measure.entity';
import { UnitOfMeasureController } from './unit-of-measure.controller';
import { UnitOfMeasureService } from './unit-of-measure.service';
import { UnitOfMeasureRepository } from './unit-of-measure.repository';

@Module({
    imports: [TypeOrmModule.forFeature([UnitOfMeasure])],
    controllers: [UnitOfMeasureController],
    providers: [
        UnitOfMeasureService,
        { provide: 'IUnitOfMeasureRepository', useClass: UnitOfMeasureRepository },
    ],
    exports: [UnitOfMeasureService, 'IUnitOfMeasureRepository'],
})
export class UnitOfMeasureModule { }


