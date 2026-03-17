import { DeviceOutbound } from '../entities/device-outbound.entity';

export interface IDeviceOutboundRepository {
    save(entity: DeviceOutbound): Promise<DeviceOutbound>;
    findById(id: string): Promise<DeviceOutbound | null>;
    findAndCount(
        limit: number,
        offset: number,
        filters?: { receptionCode?: string; serviceCode?: string },
    ): Promise<[DeviceOutbound[], number]>;
    delete(id: string): Promise<void>;
}
