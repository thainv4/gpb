import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IStoredServiceRequestServiceRepository } from '../service-request/interfaces/stored-service-request-service.repository.interface';
import { CreateDeviceOutboundDto } from './dto/commands/create-device-outbound.dto';
import { BatchCreateDeviceOutboundDto } from './dto/commands/batch-create-device-outbound.dto';
import { CancelDeviceOutboundBatchDto } from './dto/commands/cancel-device-outbound-batch.dto';
import { UpdateDeviceOutboundPatientDto } from './dto/commands/update-device-outbound-patient.dto';
import { GetDeviceOutboundListDto } from './dto/queries/get-device-outbound-list.dto';
import { DeviceOutboundResponseDto } from './dto/responses/device-outbound-response.dto';
import { DeviceOutboundDetailResponseDto } from './dto/responses/device-outbound-detail-response.dto';
import { DeviceOutboundServiceItemDto } from './dto/responses/device-outbound-service-item.dto';
import { GetDeviceOutboundListResult } from './dto/responses/device-outbound-list-response.dto';
import { CurrentUser } from '../../common/interfaces/current-user.interface';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { BaseService } from '../../common/services/base.service';
import { Hl7OutQueueService } from '../hl7-out-queue/hl7-out-queue.service';
import { Hl7OutQueueBuilderService } from '../hl7-out-queue/hl7-out-queue-builder.service';
import { Hl7OutQueue } from '../hl7-out-queue/entities/hl7-out-queue.entity';
import { toHl7OutQueueListItemDto, toHl7OutQueueDetailDto } from '../hl7-out-queue/hl7-out-queue.mapper';
import { hexToBuffer } from '../hl7-out-queue/utils/hl7-queue-id.util';

@Injectable()
export class DeviceOutboundService extends BaseService {
    constructor(
        @Inject('IStoredServiceRequestServiceRepository')
        private readonly storedServiceRepo: IStoredServiceRequestServiceRepository,
        @Inject(Hl7OutQueueService)
        private readonly hl7OutQueueService: Hl7OutQueueService,
        @Inject(Hl7OutQueueBuilderService)
        private readonly hl7OutQueueBuilder: Hl7OutQueueBuilderService,
        @Inject(DataSource)
        protected readonly dataSource: DataSource,
        @Inject(CurrentUserContextService)
        protected readonly currentUserContext: CurrentUserContextService,
    ) {
        super(dataSource, currentUserContext);
    }

    /**
     * Gửi order — insert BML_HL7_OUT_QUEUE.
     */
    async create(
        dto: CreateDeviceOutboundDto,
        currentUser: CurrentUser,
    ): Promise<DeviceOutboundResponseDto> {
        this.currentUserContext.setCurrentUser(currentUser);

        const saved = await this.dataSource.transaction(async () => {
            const payload = await this.hl7OutQueueBuilder.build(
                {
                    receptionCode: dto.receptionCode,
                    serviceCode: dto.serviceCode,
                    blockNumber: dto.blockNumber,
                    slideNumber: dto.slideNumber,
                    method: dto.method,
                },
                currentUser,
            );
            return this.hl7OutQueueService.enqueue(payload);
        });

        return this.toResponseDto(saved);
    }

    /**
     * Gửi nhiều slide — mỗi item một dòng queue; rollback nếu một dòng lỗi.
     */
    async createBatch(
        dto: BatchCreateDeviceOutboundDto,
        currentUser: CurrentUser,
    ): Promise<DeviceOutboundResponseDto[]> {
        this.currentUserContext.setCurrentUser(currentUser);

        const receptionCode = dto.receptionCode.trim();
        const serviceCode = dto.serviceCode.trim();

        return this.dataSource.transaction(async () => {
            const results: DeviceOutboundResponseDto[] = [];

            for (const item of dto.items) {
                const payload = await this.hl7OutQueueBuilder.build(
                    {
                        receptionCode,
                        serviceCode,
                        blockNumber: item.blockNumber,
                        slideNumber: item.slideNumber,
                        method: item.method,
                    },
                    currentUser,
                );
                const saved = await this.hl7OutQueueService.enqueue(payload);
                results.push(this.toResponseDto(saved));
            }

            return results;
        });
    }

    /**
     * Danh sách hàng đợi HL7 — lọc theo receptionCode (LIS_CASE_ID).
     */
    async getList(query: GetDeviceOutboundListDto): Promise<GetDeviceOutboundListResult> {
        const limit = query.limit ?? 10;
        const offset = query.offset ?? 0;

        const result = await this.hl7OutQueueService.getList(
            limit,
            offset,
            query.receptionCode?.trim() || undefined,
        );

        return {
            items: result.items.map((item) => ({
                id: item.id,
                lisCaseId: item.lisCaseId,
                slideId: item.slideId,
                blockId: item.blockId,
                testVantageCode: item.testVantageCode,
                testCode: item.testCode,
                status: item.status,
                createdTime: item.createdTime,
                sentTime: item.sentTime,
                errorMessage: item.errorMessage,
                retryCount: item.retryCount,
            })),
            total: result.total,
            limit: result.limit,
            offset: result.offset,
        };
    }

    /**
     * Hủy nhiều order — cập nhật STATUS = 3; rollback nếu một dòng lỗi.
     */
    async cancelBatch(
        dto: CancelDeviceOutboundBatchDto,
        currentUser: CurrentUser,
    ): Promise<DeviceOutboundResponseDto[]> {
        this.currentUserContext.setCurrentUser(currentUser);

        const buffers = dto.ids.map((id) => hexToBuffer(id));

        return this.dataSource.transaction(async () => {
            const saved = await this.hl7OutQueueService.cancelBatch(buffers);
            return saved.map((entity) => this.toResponseDto(entity));
        });
    }

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

    async getById(id: string): Promise<DeviceOutboundDetailResponseDto> {
        const buffer = hexToBuffer(id);
        const entity = await this.hl7OutQueueService.getById(buffer);
        return toHl7OutQueueDetailDto(entity);
    }

    async updatePatient(
        id: string,
        dto: UpdateDeviceOutboundPatientDto,
        currentUser: CurrentUser,
    ): Promise<DeviceOutboundDetailResponseDto> {
        this.currentUserContext.setCurrentUser(currentUser);

        const buffer = hexToBuffer(id);
        const saved = await this.hl7OutQueueService.updatePatient(buffer, dto);
        return toHl7OutQueueDetailDto(saved);
    }

    private toResponseDto(entity: Hl7OutQueue): DeviceOutboundResponseDto {
        const dto = toHl7OutQueueListItemDto(entity);
        return {
            id: dto.id,
            lisCaseId: dto.lisCaseId,
            slideId: dto.slideId,
            blockId: dto.blockId,
            testVantageCode: dto.testVantageCode,
            testCode: dto.testCode,
            status: dto.status,
            createdTime: dto.createdTime,
            sentTime: dto.sentTime,
            errorMessage: dto.errorMessage,
            retryCount: dto.retryCount,
        };
    }
}
