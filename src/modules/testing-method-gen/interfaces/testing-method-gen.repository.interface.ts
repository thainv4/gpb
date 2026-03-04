import { TestingMethodGen } from '../entities/testing-method-gen.entity';

export interface ITestingMethodGenRepository {
    findById(id: string): Promise<TestingMethodGen | null>;
    findByMethodName(methodName: string): Promise<TestingMethodGen | null>;
    existsByName(methodName: string): Promise<boolean>;
    save(entity: TestingMethodGen): Promise<TestingMethodGen>;
    delete(id: string): Promise<void>;
    findWithPagination(limit: number, offset: number, search?: string): Promise<[TestingMethodGen[], number]>;
}
