import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseService } from '../../common/services/base.service';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { AppError } from '../../common/errors/app.error';
import { CurrentUser } from '../../common/interfaces/current-user.interface';
import { DeviceStainingMethod } from './entities/device-staining-method.entity';
import { IDeviceStainingMethodRepository } from './interfaces/device-staining-method.repository.interface';
import { CreateDeviceStainingMethodDto } from './dto/commands/create-device-staining-method.dto';
import { UpdateDeviceStainingMethodDto } from './dto/commands/update-device-staining-method.dto';
import { GetDeviceStainingMethodsDto } from './dto/queries/get-device-staining-methods.dto';
import { DeviceStainingMethodResponseDto } from './dto/responses/device-staining-method-response.dto';

export interface GetDeviceStainingMethodsResult {
    deviceStainingMethods: DeviceStainingMethodResponseDto[];
    total: number;
    limit: number;
    offset: number;
}

@Injectable()
export class DeviceStainingMethodService extends BaseService {
    constructor(
        @Inject('IDeviceStainingMethodRepository')
        private readonly repository: IDeviceStainingMethodRepository,
        @Inject(DataSource)
        protected readonly dataSource: DataSource,
        @Inject(CurrentUserContextService)
        protected readonly currentUserContext: CurrentUserContextService,
    ) {
        super(dataSource, currentUserContext);
    }

    async create(createDto: CreateDeviceStainingMethodDto, currentUser: CurrentUser): Promise<string> {
        this.currentUserContext.setCurrentUser(currentUser);

        const exists = await this.repository.existsByName(createDto.methodName);
        if (exists) {
            throw AppError.conflict('Device staining method already exists');
        }

        return this.transactionWithAudit(async manager => {
            const entity = new DeviceStainingMethod();
            entity.methodName = createDto.methodName.trim();
            entity.protocolNo = createDto.protocolNo;
            this.setAuditFields(entity, false);

            const saved = await manager.save(DeviceStainingMethod, entity);
            return saved.id;
        });
    }

    async update(id: string, updateDto: UpdateDeviceStainingMethodDto, currentUser: CurrentUser): Promise<void> {
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async manager => {
            const existing = await this.repository.findById(id);
            if (!existing) {
                throw AppError.notFound('Device staining method not found');
            }

            if (updateDto.methodName && updateDto.methodName !== existing.methodName) {
                const duplicated = await this.repository.existsByName(updateDto.methodName);
                if (duplicated) {
                    throw AppError.conflict('Device staining method with this name already exists');
                }
            }

            const nextProtocol =
                updateDto.protocolNo !== undefined ? updateDto.protocolNo : existing.protocolNo;

            Object.assign(existing, {
                methodName: updateDto.methodName ?? existing.methodName,
                protocolNo: nextProtocol,
                updatedBy: currentUser.id,
            });

            await manager.save(DeviceStainingMethod, existing);
        });
    }

    async delete(id: string): Promise<void> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw AppError.notFound('Device staining method not found');
        }

        await this.repository.delete(id);
    }

    async getById(id: string): Promise<DeviceStainingMethodResponseDto> {
        const entity = await this.repository.findById(id);
        if (!entity) {
            throw AppError.notFound('Device staining method not found');
        }

        return this.mapToResponse(entity);
    }

    async getByMethodName(methodName: string): Promise<DeviceStainingMethodResponseDto> {
        const entity = await this.repository.findByMethodName(methodName);
        if (!entity) {
            throw AppError.notFound('Device staining method not found');
        }

        return this.mapToResponse(entity);
    }

    async getList(query: GetDeviceStainingMethodsDto): Promise<GetDeviceStainingMethodsResult> {
        const { limit = 10, offset = 0, search } = query;
        const [entities, total] = await this.repository.findWithPagination(limit, offset, search);

        return {
            deviceStainingMethods: entities.map(e => this.mapToResponse(e)),
            total,
            limit,
            offset,
        };
    }

    private mapToResponse(entity: DeviceStainingMethod): DeviceStainingMethodResponseDto {
        return {
            id: entity.id,
            methodName: entity.methodName,
            protocolNo: entity.protocolNo,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            createdBy: entity.createdBy ?? null,
            updatedBy: entity.updatedBy ?? null,
            version: entity.version,
        };
    }
}
