import { Patient } from '../entities/patient.entity';
import { SelectQueryBuilder } from 'typeorm';

export interface IPatientRepository {
    findById(id: string): Promise<Patient | null>;
    findByPatientCode(patientCode: string): Promise<Patient | null>;
    findByCmndNumber(cmndNumber: string): Promise<Patient | null>;
    existsByPatientCode(patientCode: string): Promise<boolean>;
    existsByCmndNumber(cmndNumber: string): Promise<boolean>;
    save(patient: Patient): Promise<Patient>;
    delete(id: string): Promise<void>;
    findWithPagination(
        limit: number,
        offset: number,
        search?: string,
        provinceId?: string,
        wardId?: string,
        genderId?: string
    ): Promise<[Patient[], number]>;
    searchPatients(
        searchTerm: string,
        limit?: number,
        offset?: number
    ): Promise<[Patient[], number]>;
    findByProvince(provinceId: string, limit: number, offset: number): Promise<[Patient[], number]>;
    findByWard(wardId: string, limit: number, offset: number): Promise<[Patient[], number]>;
    getNextSequenceNumber(): Promise<number>;

    // Additional methods needed by service
    findOne(options: any): Promise<Patient | null>;
    create(data: any): Patient;
    createQueryBuilder(alias: string): SelectQueryBuilder<Patient>;
}
