import { Injectable, Inject, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IWardRepository } from './interfaces/ward.repository.interface';
import { IProvinceRepository } from '../province/interfaces/province.repository.interface';
import { Ward } from './entities/ward.entity';
import { CreateWardDto } from './dto/commands/create-ward.dto';
import { UpdateWardDto } from './dto/commands/update-ward.dto';
import { DeleteWardDto } from './dto/commands/delete-ward.dto';
import { GetWardsDto } from './dto/queries/get-wards.dto';
import { GetWardByIdDto } from './dto/queries/get-ward-by-id.dto';
import { SearchWardsDto } from './dto/queries/search-wards.dto';
import { GetWardsByProvinceDto } from './dto/queries/get-wards-by-province.dto';
import { WardResponseDto } from './dto/responses/ward-response.dto';
import { WardsListResponseDto, WardPaginationDto } from './dto/responses/wards-list-response.dto';
import { BaseService } from '../../common/services/base.service';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';

export interface CurrentUser {
    id: string;
    username: string;
    email: string;
}

@Injectable()
export class WardService extends BaseService {
    constructor(
        @Inject('IWardRepository')
        private readonly wardRepository: IWardRepository,
        @Inject('IProvinceRepository')
        private readonly provinceRepository: IProvinceRepository,
        dataSource: DataSource,
        currentUserContext: CurrentUserContextService,
    ) {
        super(dataSource, currentUserContext);
    }

    // ========== COMMANDS (Write Operations) ==========

    async createWard(createWardDto: CreateWardDto, currentUser: CurrentUser): Promise<string> {
        // Set current user context for automatic audit
        this.currentUserContext.setCurrentUser(currentUser);
        
        return this.transactionWithAudit(async (manager) => {
            // Validate province exists
            const province = await this.provinceRepository.findById(createWardDto.provinceId);
            if (!province) {
                throw new NotFoundException(`Tỉnh với ID '${createWardDto.provinceId}' không tồn tại`);
            }

            // Validate ward code uniqueness
            const existingByCode = await this.wardRepository.existsByCode(createWardDto.wardCode);
            if (existingByCode) {
                throw new ConflictException(`Mã xã '${createWardDto.wardCode}' đã tồn tại`);
            }

            // Validate ward name uniqueness in province
            const existingByNameInProvince = await this.wardRepository.existsByNameInProvince(
                createWardDto.wardName,
                createWardDto.provinceId
            );
            if (existingByNameInProvince) {
                throw new ConflictException(`Tên xã '${createWardDto.wardName}' đã tồn tại trong tỉnh '${province.provinceName}'`);
            }

            // Validate short name uniqueness in province
            const existingByShortNameInProvince = await this.wardRepository.existsByShortNameInProvince(
                createWardDto.shortName,
                createWardDto.provinceId
            );
            if (existingByShortNameInProvince) {
                throw new ConflictException(`Tên viết tắt '${createWardDto.shortName}' đã tồn tại trong tỉnh '${province.provinceName}'`);
            }

            // Create new ward
            const ward = new Ward();
            ward.wardCode = createWardDto.wardCode;
            ward.wardName = createWardDto.wardName;
            ward.provinceId = createWardDto.provinceId;
            ward.shortName = createWardDto.shortName;
            ward.sortOrder = createWardDto.sortOrder;
            ward.isActive = createWardDto.isActive ?? true;

            // ✅ Automatic audit fields - no manual assignment needed!
            this.setAuditFields(ward, false); // false = create operation

            const savedWard = await manager.save(Ward, ward);
            return savedWard.id;
        });
    }

    async updateWard(id: string, updateWardDto: UpdateWardDto, currentUser: CurrentUser): Promise<void> {
        // Set current user context for automatic audit
        this.currentUserContext.setCurrentUser(currentUser);
        
        return this.transactionWithAudit(async (manager) => {
            const ward = await this.wardRepository.findById(id);
            if (!ward) {
                throw new NotFoundException('Không tìm thấy xã');
            }

            // Validate province exists (if being updated)
            if (updateWardDto.provinceId && updateWardDto.provinceId !== ward.provinceId) {
                const province = await this.provinceRepository.findById(updateWardDto.provinceId);
                if (!province) {
                    throw new NotFoundException(`Tỉnh với ID '${updateWardDto.provinceId}' không tồn tại`);
                }
            }

            // Validate ward code uniqueness (if being updated)
            if (updateWardDto.wardCode && updateWardDto.wardCode !== ward.wardCode) {
                const existingByCode = await this.wardRepository.existsByCode(updateWardDto.wardCode, id);
                if (existingByCode) {
                    throw new ConflictException(`Mã xã '${updateWardDto.wardCode}' đã tồn tại`);
                }
            }

            // Validate ward name uniqueness in province (if being updated)
            if (updateWardDto.wardName && updateWardDto.wardName !== ward.wardName) {
                const targetProvinceId = updateWardDto.provinceId || ward.provinceId;
                const existingByNameInProvince = await this.wardRepository.existsByNameInProvince(
                    updateWardDto.wardName,
                    targetProvinceId,
                    id
                );
                if (existingByNameInProvince) {
                    throw new ConflictException(`Tên xã '${updateWardDto.wardName}' đã tồn tại trong tỉnh`);
                }
            }

            // Validate short name uniqueness in province (if being updated)
            if (updateWardDto.shortName && updateWardDto.shortName !== ward.shortName) {
                const targetProvinceId = updateWardDto.provinceId || ward.provinceId;
                const existingByShortNameInProvince = await this.wardRepository.existsByShortNameInProvince(
                    updateWardDto.shortName,
                    targetProvinceId,
                    id
                );
                if (existingByShortNameInProvince) {
                    throw new ConflictException(`Tên viết tắt '${updateWardDto.shortName}' đã tồn tại trong tỉnh`);
                }
            }

            // Update ward fields
            if (updateWardDto.wardCode !== undefined) {
                ward.wardCode = updateWardDto.wardCode;
            }
            if (updateWardDto.wardName !== undefined) {
                ward.wardName = updateWardDto.wardName;
            }
            if (updateWardDto.provinceId !== undefined) {
                ward.provinceId = updateWardDto.provinceId;
            }
            if (updateWardDto.shortName !== undefined) {
                ward.shortName = updateWardDto.shortName;
            }
            if (updateWardDto.sortOrder !== undefined) {
                ward.sortOrder = updateWardDto.sortOrder;
            }
            if (updateWardDto.isActive !== undefined) {
                ward.isActive = updateWardDto.isActive;
            }

            // ✅ Automatic audit fields - no manual assignment needed!
            this.setAuditFields(ward, true); // true = update operation

            await manager.save(Ward, ward);
        });
    }

    async deleteWard(deleteWardDto: DeleteWardDto, currentUser: CurrentUser): Promise<void> {
        return this.dataSource.transaction(async (manager) => {
            const ward = await this.wardRepository.findById(deleteWardDto.id);
            if (!ward) {
                throw new NotFoundException('Không tìm thấy xã');
            }

            if (deleteWardDto.hardDelete) {
                // Hard delete
                await this.wardRepository.delete(deleteWardDto.id);
            } else {
                // Soft delete
                await this.wardRepository.softDelete(deleteWardDto.id);
            }
        });
    }

    // ========== QUERIES (Read Operations) ==========

    async getWardById(getWardByIdDto: GetWardByIdDto): Promise<WardResponseDto> {
        const ward = await this.wardRepository.findById(getWardByIdDto.id);
        if (!ward) {
            throw new NotFoundException('Không tìm thấy xã');
        }

        return this.mapWardToResponseDto(ward);
    }

    async getWards(getWardsDto: GetWardsDto): Promise<WardsListResponseDto> {
        const { limit = 10, offset = 0, sortBy, sortOrder, isActive, provinceId, search } = getWardsDto;

        const [wards, total] = await this.wardRepository.findWithPagination(
            limit,
            offset,
            sortBy,
            sortOrder,
            { isActive, search, provinceId }
        );

        const totalPages = Math.ceil(total / limit);
        const currentPage = Math.floor(offset / limit) + 1;

        const pagination: WardPaginationDto = {
            total,
            limit,
            offset,
            hasNext: offset + limit < total,
            hasPrev: offset > 0,
            totalPages,
            currentPage,
        };

        // Get statistics
        const [totalCount, activeCount, inactiveCount] = await Promise.all([
            this.wardRepository.countTotal(),
            this.wardRepository.countActive(),
            this.wardRepository.countInactive(),
        ]);

        return {
            wards: wards.map(ward => this.mapWardToResponseDto(ward)),
            pagination,
            statistics: {
                total: totalCount,
                active: activeCount,
                inactive: inactiveCount,
            },
        };
    }

    async searchWards(searchWardsDto: SearchWardsDto): Promise<WardsListResponseDto> {
        const { keyword, searchType = 'all', provinceId, limit = 10, offset = 0, sortBy, sortOrder } = searchWardsDto;

        let wards: Ward[] = [];

        // Search based on type and province
        if (provinceId) {
            wards = await this.wardRepository.searchByProvinceAndKeyword(provinceId, keyword);
        } else {
            switch (searchType) {
                case 'name':
                    wards = await this.wardRepository.searchByName(keyword);
                    break;
                case 'code':
                    wards = await this.wardRepository.searchByCode(keyword);
                    break;
                case 'shortName':
                    wards = await this.wardRepository.searchByShortName(keyword);
                    break;
                case 'all':
                default:
                    wards = await this.wardRepository.searchByKeyword(keyword);
                    break;
            }
        }

        // Apply pagination
        const total = wards.length;
        const paginatedWards = wards.slice(offset, offset + limit);

        const totalPages = Math.ceil(total / limit);
        const currentPage = Math.floor(offset / limit) + 1;

        const pagination: WardPaginationDto = {
            total,
            limit,
            offset,
            hasNext: offset + limit < total,
            hasPrev: offset > 0,
            totalPages,
            currentPage,
        };

        // Get statistics
        const [totalCount, activeCount, inactiveCount] = await Promise.all([
            this.wardRepository.countTotal(),
            this.wardRepository.countActive(),
            this.wardRepository.countInactive(),
        ]);

        return {
            wards: paginatedWards.map(ward => this.mapWardToResponseDto(ward)),
            pagination,
            statistics: {
                total: totalCount,
                active: activeCount,
                inactive: inactiveCount,
            },
        };
    }

    async getWardsByProvince(getWardsByProvinceDto: GetWardsByProvinceDto): Promise<WardsListResponseDto> {
        const { provinceId, limit = 10, offset = 0, sortBy, sortOrder, isActive, search } = getWardsByProvinceDto;

        // Validate province exists
        const province = await this.provinceRepository.findById(provinceId);
        if (!province) {
            throw new NotFoundException(`Tỉnh với ID '${provinceId}' không tồn tại`);
        }

        const [wards, total] = await this.wardRepository.findWithPagination(
            limit,
            offset,
            sortBy,
            sortOrder,
            { isActive, search, provinceId }
        );

        const totalPages = Math.ceil(total / limit);
        const currentPage = Math.floor(offset / limit) + 1;

        const pagination: WardPaginationDto = {
            total,
            limit,
            offset,
            hasNext: offset + limit < total,
            hasPrev: offset > 0,
            totalPages,
            currentPage,
        };

        // Get statistics for this province
        const [totalCount, activeCount] = await Promise.all([
            this.wardRepository.countByProvince(provinceId),
            this.wardRepository.countActiveByProvince(provinceId),
        ]);
        const inactiveCount = totalCount - activeCount;

        return {
            wards: wards.map(ward => this.mapWardToResponseDto(ward)),
            pagination,
            statistics: {
                total: totalCount,
                active: activeCount,
                inactive: inactiveCount,
                byProvince: {
                    [provinceId]: totalCount,
                },
            },
        };
    }

    // ========== UTILITY METHODS ==========

    async getWardsStats(): Promise<{ total: number; active: number; inactive: number }> {
        const [total, active, inactive] = await Promise.all([
            this.wardRepository.countTotal(),
            this.wardRepository.countActive(),
            this.wardRepository.countInactive(),
        ]);

        return { total, active, inactive };
    }

    async getWardsStatsByProvince(provinceId: string): Promise<{ total: number; active: number; inactive: number }> {
        const [total, active] = await Promise.all([
            this.wardRepository.countByProvince(provinceId),
            this.wardRepository.countActiveByProvince(provinceId),
        ]);

        return { total, active, inactive: total - active };
    }

    async reorderWards(provinceId?: string): Promise<void> {
        await this.wardRepository.reorderSortOrder(provinceId);
    }

    // ========== PRIVATE METHODS ==========

    private mapWardToResponseDto(ward: Ward): WardResponseDto {
        return {
            id: ward.id,
            wardCode: ward.wardCode,
            wardName: ward.wardName,
            provinceId: ward.provinceId,
            shortName: ward.shortName,
            sortOrder: ward.sortOrder,
            isActive: ward.isActive,
            createdAt: ward.createdAt,
            updatedAt: ward.updatedAt,
            createdBy: ward.createdBy,
            updatedBy: ward.updatedBy,
            version: ward.version,
            displayName: ward.getDisplayName(),
            province: ward.province ? {
                id: ward.province.id,
                provinceCode: ward.province.provinceCode,
                provinceName: ward.province.provinceName,
                shortName: ward.province.shortName,
            } : undefined,
        };
    }
}
