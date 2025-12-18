import { Injectable, NotFoundException, ConflictException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { Province } from '../province/entities/province.entity';
import { Ward } from '../ward/entities/ward.entity';
import { BaseService } from '../../shared/services/base.service';
import { CurrentUserContextService } from '../../shared/services/current-user-context.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser as ICurrentUser } from '../../common/interfaces/current-user.interface';
import { CreatePatientDto } from './dto/commands/create-patient.dto';
import { UpdatePatientDto } from './dto/commands/update-patient.dto';
import { GetPatientsDto } from './dto/queries/get-patients.dto';
import { SearchPatientsDto } from './dto/queries/search-patients.dto';
import { GetPatientByIdDto } from './dto/queries/get-patient-by-id.dto';
import { GetPatientsByCmndDto } from './dto/queries/get-patients-by-cmnd.dto';
import { PatientResponseDto } from './dto/responses/patient-response.dto';
import { PatientWithLocationResponseDto } from './dto/responses/patient-with-location-response.dto';
import { GetPatientsResult } from './dto/responses/patients-list-response.dto';
import { IPatientRepository } from './interfaces/patient.repository.interface';

@Injectable()
export class PatientService extends BaseService {
  constructor(
    @Inject('IPatientRepository')
    private readonly patientRepository: IPatientRepository,
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
    @InjectRepository(Ward)
    private readonly wardRepository: Repository<Ward>,
    protected readonly dataSource: DataSource,
    protected readonly currentUserContextService: CurrentUserContextService,
  ) {
    super(dataSource, currentUserContextService);
  }

  // ========== COMMANDS (Write Operations) ==========

  async createPatient(createDto: CreatePatientDto, @CurrentUser() currentUser: ICurrentUser): Promise<string> {
    return this.dataSource.transaction(async (manager) => {
      // Check if patient code already exists
      const existingPatient = await this.patientRepository.findOne({
        where: { patientCode: createDto.patientCode }
      });
      if (existingPatient) {
        throw new ConflictException('Patient with this code already exists');
      }

      // Check if CMND already exists
      const existingCmnd = await this.patientRepository.findOne({
        where: { cmndNumber: createDto.cmndNumber }
      });
      if (existingCmnd) {
        throw new ConflictException('Patient with this CMND number already exists');
      }

      // Validate province exists
      if (createDto.provinceId) {
        const province = await this.provinceRepository.findOne({
          where: { id: createDto.provinceId }
        });
        if (!province) {
          throw new NotFoundException('Province not found');
        }
      }

      // Validate ward exists
      if (createDto.wardId) {
        const ward = await this.wardRepository.findOne({
          where: { id: createDto.wardId }
        });
        if (!ward) {
          throw new NotFoundException('Ward not found');
        }
      }

      // Generate patient code if not provided
      let patientCode = createDto.patientCode;
      if (!patientCode) {
        patientCode = await this.generatePatientCode();
      }

      // Create patient
      const patient = this.patientRepository.create({
        patientCode,
        patientName: createDto.patientName,
        dateOfBirth: createDto.dateOfBirth,
        cmndNumber: createDto.cmndNumber,
        cmndDate: createDto.cmndDate,
        cmndPlace: createDto.cmndPlace,
        mobile: createDto.mobile,
        phone: createDto.phone,
        provinceId: createDto.provinceId,
        wardId: createDto.wardId,
        address: createDto.address,
        genderId: createDto.genderId,
        genderName: createDto.genderName,
        careerName: createDto.careerName,
        hisId: createDto.hisId,
      });

      // Set audit fields
      patient.createdBy = currentUser.id;
      patient.updatedBy = currentUser.id;

      const savedPatient = await manager.save(Patient, patient);
      return savedPatient.id;
    });
  }

  async updatePatient(id: string, updateDto: UpdatePatientDto, @CurrentUser() currentUser: ICurrentUser): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const patient = await this.patientRepository.findOne({
        where: { id, deletedAt: null }
      });
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }

      // Check if new patient code already exists (if being updated)
      if (updateDto.patientCode && updateDto.patientCode !== patient.patientCode) {
        const existingPatient = await this.patientRepository.findOne({
          where: { patientCode: updateDto.patientCode }
        });
        if (existingPatient) {
          throw new ConflictException('Patient with this code already exists');
        }
      }

      // Check if new CMND already exists (if being updated)
      if (updateDto.cmndNumber && updateDto.cmndNumber !== patient.cmndNumber) {
        const existingCmnd = await this.patientRepository.findOne({
          where: { cmndNumber: updateDto.cmndNumber }
        });
        if (existingCmnd) {
          throw new ConflictException('Patient with this CMND number already exists');
        }
      }

      // Validate province exists (if being updated)
      if (updateDto.provinceId) {
        const province = await this.provinceRepository.findOne({
          where: { id: updateDto.provinceId }
        });
        if (!province) {
          throw new NotFoundException('Province not found');
        }
      }

      // Validate ward exists (if being updated)
      if (updateDto.wardId) {
        const ward = await this.wardRepository.findOne({
          where: { id: updateDto.wardId }
        });
        if (!ward) {
          throw new NotFoundException('Ward not found');
        }
      }

      // Update patient fields
      Object.assign(patient, updateDto);
      patient.updatedBy = currentUser.id;

      await manager.save(Patient, patient);
    });
  }

  async deletePatient(id: string): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const patient = await this.patientRepository.findOne({
        where: { id, deletedAt: null }
      });
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }

      // Soft delete
      patient.deletedAt = new Date();
      await manager.save(Patient, patient);
    });
  }

  // ========== QUERIES (Read Operations) ==========

  async getPatientById(id: string): Promise<PatientResponseDto> {
    const patient = await this.patientRepository.findOne({
      where: { id, deletedAt: null }
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.mapPatientToResponseDto(patient);
  }

  async getPatients(query: GetPatientsDto): Promise<GetPatientsResult> {
    const { limit = 10, offset = 0, search, genderId, provinceId, wardId, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

    const queryBuilder = this.patientRepository
      .createQueryBuilder('patient')
      .where('patient.deletedAt IS NULL')
      .orderBy(`patient.${sortBy}`, sortOrder as 'ASC' | 'DESC')
      .limit(limit)
      .offset(offset);

    // Add search condition
    if (search) {
      queryBuilder.andWhere(
        '(patient.patientName ILIKE :search OR patient.patientCode ILIKE :search OR patient.cmndNumber ILIKE :search OR patient.mobile ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Add gender filter
    if (genderId) {
      queryBuilder.andWhere('patient.genderId = :genderId', { genderId });
    }

    // Add province filter
    if (provinceId) {
      queryBuilder.andWhere('patient.provinceId = :provinceId', { provinceId });
    }

    // Add ward filter
    if (wardId) {
      queryBuilder.andWhere('patient.wardId = :wardId', { wardId });
    }

    const [patients, total] = await queryBuilder.getManyAndCount();

    return {
      patients: patients.map(patient => this.mapPatientToResponseDto(patient)),
      total,
      limit,
      offset,
    };
  }

  async searchPatients(query: SearchPatientsDto): Promise<PatientResponseDto[]> {
    const { search, genderId, provinceId, wardId, limit = 50 } = query;

    const queryBuilder = this.patientRepository
      .createQueryBuilder('patient')
      .where('patient.deletedAt IS NULL')
      .orderBy('patient.createdAt', 'DESC')
      .limit(limit);

    // Add search condition
    if (search) {
      queryBuilder.andWhere(
        '(patient.patientName ILIKE :search OR patient.patientCode ILIKE :search OR patient.cmndNumber ILIKE :search OR patient.mobile ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Add filters
    if (genderId) {
      queryBuilder.andWhere('patient.genderId = :genderId', { genderId });
    }
    if (provinceId) {
      queryBuilder.andWhere('patient.provinceId = :provinceId', { provinceId });
    }
    if (wardId) {
      queryBuilder.andWhere('patient.wardId = :wardId', { wardId });
    }

    const patients = await queryBuilder.getMany();
    return patients.map(patient => this.mapPatientToResponseDto(patient));
  }

  async getPatientByCmnd(cmndNumber: string): Promise<PatientResponseDto> {
    const patient = await this.patientRepository.findOne({
      where: { cmndNumber, deletedAt: null }
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.mapPatientToResponseDto(patient);
  }

  async getPatientWithLocation(id: string): Promise<PatientWithLocationResponseDto> {
    const patient = await this.patientRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['province', 'ward']
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.mapPatientToLocationResponseDto(patient);
  }

  // ========== PRIVATE METHODS ==========

  private async generatePatientCode(): Promise<string> {
    const now = new Date();
    const yearMonth = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, '0');

    // Get next sequence number for this month
    const lastPatient = await this.patientRepository
      .createQueryBuilder('patient')
      .where('patient.patientCode LIKE :pattern', { pattern: `BN${yearMonth}.%` })
      .orderBy('patient.patientCode', 'DESC')
      .getOne();

    let sequenceNumber = 1;
    if (lastPatient) {
      const lastSequence = parseInt(lastPatient.patientCode.split('.')[1]);
      sequenceNumber = lastSequence + 1;
    }

    return `BN${yearMonth}.${sequenceNumber.toString().padStart(4, '0')}`;
  }

  private mapPatientToResponseDto(patient: Patient): PatientResponseDto {
    return {
      id: patient.id,
      patientCode: patient.patientCode,
      patientName: patient.patientName,
      dateOfBirth: patient.dateOfBirth instanceof Date ? patient.dateOfBirth.toISOString().split('T')[0] : patient.dateOfBirth,
      age: patient.calculateAge(),
      cmndNumber: patient.cmndNumber,
      cmndDate: patient.cmndDate ? (patient.cmndDate instanceof Date ? patient.cmndDate.toISOString().split('T')[0] : patient.cmndDate) : undefined,
      cmndPlace: patient.cmndPlace,
      mobile: patient.mobile,
      phone: patient.phone,
      provinceId: patient.provinceId,
      wardId: patient.wardId,
      address: patient.address,
      fullAddress: patient.getFullAddress(),
      genderId: patient.genderId,
      genderName: patient.genderName,
      careerName: patient.careerName,
      hisId: patient.hisId,
      displayName: patient.getDisplayName(),
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
      createdBy: patient.createdBy,
      updatedBy: patient.updatedBy,
    };
  }

  private mapPatientToLocationResponseDto(patient: Patient): PatientWithLocationResponseDto {
    const baseResponse = this.mapPatientToResponseDto(patient);

    return {
      ...baseResponse,
      province: patient.province ? {
        id: patient.province.id,
        provinceCode: patient.province.provinceCode,
        provinceName: patient.province.provinceName,
        shortName: patient.province.shortName,
      } : null,
      ward: patient.ward ? {
        id: patient.ward.id,
        wardCode: patient.ward.wardCode,
        wardName: patient.ward.wardName,
        shortName: patient.ward.shortName,
        provinceId: patient.ward.provinceId,
      } : null,
    };
  }
}
