import { DeviceStainingMethod } from '../entities/device-staining-method.entity';

export interface IDeviceStainingMethodRepository {
    findById(id: string): Promise<DeviceStainingMethod | null>;
    findByMethodName(methodName: string): Promise<DeviceStainingMethod | null>;
    existsByName(methodName: string): Promise<boolean>;
    save(entity: DeviceStainingMethod): Promise<DeviceStainingMethod>;
    delete(id: string): Promise<void>;
    findWithPagination(limit: number, offset: number, search?: string): Promise<[DeviceStainingMethod[], number]>;
}
