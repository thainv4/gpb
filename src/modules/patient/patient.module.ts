import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { Province } from '../province/entities/province.entity';
import { Ward } from '../ward/entities/ward.entity';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { PatientRepository } from './patient.repository';
import { ServicesModule } from '../../shared/services/services.module';
import { DataLoaderModule } from '../../shared/dataloaders/dataloader.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, Province, Ward]),
    ServicesModule,
    DataLoaderModule,
    AuthModule, // Import để sử dụng DualAuthGuard
  ],
  controllers: [PatientController],
  providers: [
    PatientService,
    {
      provide: 'IPatientRepository',
      useClass: PatientRepository,
    },
  ],
  exports: [
    PatientService,
    'IPatientRepository',
  ],
})
export class PatientModule {}
