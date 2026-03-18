import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IDeviceOutboundRepository } from './interfaces/device-outbound.repository.interface';
import { IStoredServiceRequestServiceRepository } from '../service-request/interfaces/stored-service-request-service.repository.interface';
import { DeviceOutbound } from './entities/device-outbound.entity';
import { CreateDeviceOutboundDto } from './dto/commands/create-device-outbound.dto';
import { BatchCreateDeviceOutboundDto } from './dto/commands/batch-create-device-outbound.dto';
import { UpdateDeviceOutboundDto } from './dto/commands/update-device-outbound.dto';
import { GetDeviceOutboundListDto } from './dto/queries/get-device-outbound-list.dto';
import { DeviceOutboundResponseDto } from './dto/responses/device-outbound-response.dto';
import { DeviceOutboundServiceItemDto } from './dto/responses/device-outbound-service-item.dto';
import { GetDeviceOutboundListResult } from './dto/responses/device-outbound-list-response.dto';
import { CurrentUser } from '../../common/interfaces/current-user.interface';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { BaseService } from '../../common/services/base.service';

@Injectable()
export class DeviceOutboundService extends BaseService {
    constructor(
        @Inject('IDeviceOutboundRepository')
        private readonly deviceOutboundRepo: IDeviceOutboundRepository,
        @Inject('IStoredServiceRequestServiceRepository')
        private readonly storedServiceRepo: IStoredServiceRequestServiceRepository,
        protected readonly dataSource: DataSource,
        @Inject(CurrentUserContextService)
        protected readonly currentUserContext: CurrentUserContextService,
    ) {
        super(dataSource, currentUserContext);
    }

    /**
     * Tạo bản ghi Device Outbound.
     * Block_ID = receptionCode + 'A.' + blockNumber (vd: S2601.0312A.2)
     * Slide_id = receptionCode + 'A.' + blockNumber + '.' + slideNumber (vd: S2601.0312A.2.3)
     */
    async create(
        dto: CreateDeviceOutboundDto,
        currentUser: CurrentUser,
    ): Promise<DeviceOutboundResponseDto> {
        this.currentUserContext.setCurrentUser(currentUser);

        const blockId = `${dto.receptionCode}A.${dto.blockNumber}`;
        const slideId = `${dto.receptionCode}A.${dto.blockNumber}.${dto.slideNumber}`;

        const entity = new DeviceOutbound();
        entity.receptionCode = dto.receptionCode;
        entity.serviceCode = dto.serviceCode;
        entity.blockId = blockId;
        entity.slideId = slideId;
        entity.method = dto.method;
        this.setAuditFields(entity, false);

        const saved = await this.deviceOutboundRepo.save(entity);
        return this.toResponseDto(saved);
    }

    /**
     * Tạo nhiều bản ghi Device Outbound trong một lần gọi (batch).
     * Thực hiện trong transaction, nếu một dòng lỗi thì rollback toàn bộ.
     */
    async createBatch(
        dto: BatchCreateDeviceOutboundDto,
        currentUser: CurrentUser,
    ): Promise<DeviceOutboundResponseDto[]> {
        this.currentUserContext.setCurrentUser(currentUser);

        const receptionCode = dto.receptionCode.trim();
        const serviceCode = dto.serviceCode.trim();

        return this.dataSource.transaction(async (manager) => {
            const repo = manager.getRepository(DeviceOutbound);
            const results: DeviceOutboundResponseDto[] = [];

            for (const item of dto.items) {
                const blockId = `${receptionCode}A.${item.blockNumber}`;
                const slideId = `${receptionCode}A.${item.blockNumber}.${item.slideNumber}`;

                const entity = new DeviceOutbound();
                entity.receptionCode = receptionCode;
                entity.serviceCode = serviceCode;
                entity.blockId = blockId;
                entity.slideId = slideId;
                entity.method = item.method;
                this.setAuditFields(entity, false);

                const saved = await repo.save(entity);
                results.push(this.toResponseDto(saved));
            }

            return results;
        });
    }

    /**
     * Lấy một bản ghi theo ID.
     */
    async getById(id: string): Promise<DeviceOutboundResponseDto> {
        const entity = await this.deviceOutboundRepo.findById(id);
        if (!entity) {
            throw new NotFoundException('Device outbound not found');
        }
        return this.toResponseDto(entity);
    }

    /**
     * Danh sách bản ghi có phân trang và lọc theo receptionCode, serviceCode.
     */
    async getList(query: GetDeviceOutboundListDto): Promise<GetDeviceOutboundListResult> {
        const limit = query.limit ?? 10;
        const offset = query.offset ?? 0;
        const filters: { receptionCode?: string; serviceCode?: string } = {};
        if (query.receptionCode?.trim()) filters.receptionCode = query.receptionCode.trim();
        if (query.serviceCode?.trim()) filters.serviceCode = query.serviceCode.trim();

        const [entities, total] = await this.deviceOutboundRepo.findAndCount(limit, offset, filters);
        return {
            items: entities.map((e) => this.toResponseDto(e)),
            total,
            limit,
            offset,
        };
    }

    /**
     * Cập nhật bản ghi. Nếu đổi receptionCode/blockNumber/slideNumber thì Block_ID và Slide_id được tính lại.
     */
    async update(
        id: string,
        dto: UpdateDeviceOutboundDto,
        currentUser: CurrentUser,
    ): Promise<DeviceOutboundResponseDto> {
        this.currentUserContext.setCurrentUser(currentUser);

        const entity = await this.deviceOutboundRepo.findById(id);
        if (!entity) {
            throw new NotFoundException('Device outbound not found');
        }

        if (dto.receptionCode !== undefined) entity.receptionCode = dto.receptionCode;
        if (dto.serviceCode !== undefined) entity.serviceCode = dto.serviceCode;
        if (dto.method !== undefined) entity.method = dto.method;

        if (
            dto.receptionCode !== undefined ||
            dto.blockNumber !== undefined ||
            dto.slideNumber !== undefined
        ) {
            const receptionCode = entity.receptionCode;
            const blockNumber = dto.blockNumber ?? this.parseBlockNumberFromBlockId(entity.blockId);
            const slideNumber = dto.slideNumber ?? this.parseSlideNumberFromSlideId(entity.slideId);
            entity.blockId = `${receptionCode}A.${blockNumber}`;
            entity.slideId = `${receptionCode}A.${blockNumber}.${slideNumber}`;
        }

        this.setAuditFields(entity, true);
        const saved = await this.deviceOutboundRepo.save(entity);
        return this.toResponseDto(saved);
    }

    /**
     * Xóa mềm bản ghi.
     */
    async delete(id: string): Promise<void> {
        const entity = await this.deviceOutboundRepo.findById(id);
        if (!entity) {
            throw new NotFoundException('Device outbound not found');
        }
        await this.deviceOutboundRepo.delete(id);
    }

    /**
     * Lấy danh sách dịch vụ theo mã tiếp nhận (từ BML_STORED_SR_SERVICES).
     * Dùng cho dropdown chọn dịch vụ khi nhập Device Outbound.
     */
    async getServicesByReceptionCode(receptionCode: string): Promise<DeviceOutboundServiceItemDto[]> {
        const services = await this.storedServiceRepo.findByReceptionCode(receptionCode);
        return services.map((s) => ({
            id: s.id,
            serviceCode: s.serviceCode ?? null,
            serviceName: s.serviceName ?? null,
            isChildService: s.isChildService,
            parentServiceId: s.parentServiceId ?? null,
        }));
    }

    private parseBlockNumberFromBlockId(blockId: string): number {
        const match = blockId.match(/A\.(\d+)$/);
        return match ? parseInt(match[1], 10) : 1;
    }

    private parseSlideNumberFromSlideId(slideId: string): number {
        const parts = slideId.split('.');
        const last = parts[parts.length - 1];
        const num = parseInt(last, 10);
        return Number.isNaN(num) ? 1 : num;
    }

    private toResponseDto(entity: DeviceOutbound): DeviceOutboundResponseDto {
        return {
            id: entity.id,
            receptionCode: entity.receptionCode,
            serviceCode: entity.serviceCode,
            blockId: entity.blockId,
            slideId: entity.slideId,
            method: entity.method,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
}
