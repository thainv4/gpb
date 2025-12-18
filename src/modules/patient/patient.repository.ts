import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Like } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { IPatientRepository } from './interfaces/patient.repository.interface';

@Injectable()
export class PatientRepository implements IPatientRepository {
    constructor(
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,
    ) { }

    async findById(id: string): Promise<Patient | null> {
        return this.patientRepository.findOne({
            where: { id, deletedAt: IsNull() },
            relations: ['province', 'ward'],
        });
    }

    async findByPatientCode(patientCode: string): Promise<Patient | null> {
        return this.patientRepository.findOne({
            where: { patientCode, deletedAt: IsNull() },
            relations: ['province', 'ward'],
        });
    }

    async findByCmndNumber(cmndNumber: string): Promise<Patient | null> {
        return this.patientRepository.findOne({
            where: { cmndNumber, deletedAt: IsNull() },
            relations: ['province', 'ward'],
        });
    }

    async existsByPatientCode(patientCode: string): Promise<boolean> {
        return this.patientRepository.count({
            where: { patientCode, deletedAt: IsNull() },
        }).then(count => count > 0);
    }

    async existsByCmndNumber(cmndNumber: string): Promise<boolean> {
        return this.patientRepository.count({
            where: { cmndNumber, deletedAt: IsNull() },
        }).then(count => count > 0);
    }

    async save(patient: Patient): Promise<Patient> {
        return this.patientRepository.save(patient);
    }

    async delete(id: string): Promise<void> {
        await this.patientRepository.softDelete(id);
    }

    async findWithPagination(
        limit: number,
        offset: number,
        search?: string,
        provinceId?: string,
        wardId?: string,
        genderId?: string,
    ): Promise<[Patient[], number]> {
        const queryBuilder = this.patientRepository.createQueryBuilder('patient');
        queryBuilder.leftJoinAndSelect('patient.province', 'province');
        queryBuilder.leftJoinAndSelect('patient.ward', 'ward');
        queryBuilder.where('patient.deletedAt IS NULL');

        if (search) {
            queryBuilder.andWhere(
                '(patient.patientName LIKE :search OR patient.patientCode LIKE :search OR patient.cmndNumber LIKE :search OR patient.mobile LIKE :search)',
                { search: `%${search}%` },
            );
        }

        if (provinceId) {
            queryBuilder.andWhere('patient.provinceId = :provinceId', { provinceId });
        }

        if (wardId) {
            queryBuilder.andWhere('patient.wardId = :wardId', { wardId });
        }

        if (genderId) {
            queryBuilder.andWhere('patient.genderId = :genderId', { genderId });
        }

        queryBuilder.orderBy('patient.createdAt', 'DESC');
        queryBuilder.take(limit);
        queryBuilder.skip(offset);

        return queryBuilder.getManyAndCount();
    }

    async searchPatients(
        searchTerm: string,
        limit: number = 50,
        offset: number = 0,
    ): Promise<[Patient[], number]> {
        return this.findWithPagination(limit, offset, searchTerm);
    }

    async findByProvince(provinceId: string, limit: number, offset: number): Promise<[Patient[], number]> {
        return this.findWithPagination(limit, offset, undefined, provinceId);
    }

    async findByWard(wardId: string, limit: number, offset: number): Promise<[Patient[], number]> {
        return this.findWithPagination(limit, offset, undefined, undefined, wardId);
    }

    async getNextSequenceNumber(): Promise<number> {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const dateStr = `${year}${month.toString().padStart(2, '0')}`;

        const result = await this.patientRepository
            .createQueryBuilder('patient')
            .select('MAX(patient.sequenceNumber)', 'maxSequence')
            .where('patient.patientCode LIKE :pattern', { pattern: `BN${dateStr}.%` })
            .andWhere('patient.deletedAt IS NULL')
            .getRawOne();

        return (result?.maxSequence || 0) + 1;
    }

    // Additional methods needed by service
    async findOne(options: any): Promise<Patient | null> {
        return this.patientRepository.findOne(options);
    }

    create(data: any): Patient {
        return this.patientRepository.create(data) as unknown as Patient;
    }

    createQueryBuilder(alias: string) {
        return this.patientRepository.createQueryBuilder(alias);
    }
}
