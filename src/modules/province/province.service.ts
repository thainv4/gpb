import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Province } from './entities/province.entity';
import { IProvinceRepository } from './interfaces/province.repository.interface';
import { CreateProvinceDto } from './dto/commands/create-province.dto';
import { UpdateProvinceDto } from './dto/commands/update-province.dto';
import { GetProvincesDto } from './dto/queries/get-provinces.dto';
import { ProvinceResponseDto } from './dto/responses/province-response.dto';
// import { ProvinceStatsDto } from './dto/responses/province-stats.dto';
import { DataLoaderService, DataLoaders } from '../../shared/dataloaders/dataloader.service';
import { AppError } from '../../common/errors/app.error';
import { BaseService } from '../../common/services/base.service';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';

export interface CurrentUser {
    id: string;
    username: string;
    email: string;
}

export interface GetProvincesResult {
    provinces: ProvinceResponseDto[];
    total: number;
    limit: number;
    offset: number;
}

@Injectable()
export class ProvinceService extends BaseService {
    constructor(
        @Inject('IProvinceRepository')
        private readonly provinceRepository: IProvinceRepository,
        @Inject(DataSource)
        protected readonly dataSource: DataSource,
        private readonly dataLoaderService: DataLoaderService,
        @Inject(CurrentUserContextService)
        protected readonly currentUserContext: CurrentUserContextService,
    ) {
        super(dataSource, currentUserContext);
    }

    // ========== COMMANDS (Write Operations) ==========

    async createProvince(createProvinceDto: CreateProvinceDto, currentUser: CurrentUser): Promise<string> {
        // Set current user context for automatic audit
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            // Check if province code already exists
            const existingProvince = await this.provinceRepository.findByCode(createProvinceDto.provinceCode);
            if (existingProvince) {
                throw AppError.conflict('Province with this code already exists');
            }

            // Create province
            const province = new Province();
            province.provinceCode = createProvinceDto.provinceCode;
            province.provinceName = createProvinceDto.provinceName;
            province.shortName = createProvinceDto.shortName;
            province.sortOrder = createProvinceDto.sortOrder || await this.getNextSortOrder();

            // ✅ Manual audit fields assignment
            province.createdBy = currentUser.id;
            province.updatedBy = currentUser.id;

            const savedProvince = await manager.save(Province, province);
            return savedProvince.id;
        });
    }

    async updateProvince(id: string, updateProvinceDto: UpdateProvinceDto, currentUser: CurrentUser): Promise<void> {
        // Set current user context for automatic audit
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            const province = await this.provinceRepository.findById(id);
            if (!province) {
                throw AppError.notFound('Province not found');
            }

            // Update province fields
            Object.assign(province, updateProvinceDto);

            // ✅ Automatic audit fields - no manual assignment needed!
            this.setAuditFields(province, true); // true = update operation

            await manager.save(Province, province);
        });
    }

    async deleteProvince(id: string): Promise<void> {
        return this.dataSource.transaction(async (manager) => {
            const province = await this.provinceRepository.findById(id);
            if (!province) {
                throw AppError.notFound('Province not found');
            }

            await this.provinceRepository.delete(id);
        });
    }

    // ========== QUERIES (Read Operations) ==========

    async getProvinceById(id: string): Promise<ProvinceResponseDto> {
        const province = await this.provinceRepository.findById(id);
        if (!province) {
            throw AppError.notFound('Province not found');
        }

        return this.mapProvinceToResponseDto(province);
    }

    async getProvinces(query: GetProvincesDto): Promise<GetProvincesResult> {
        const { limit = 10, offset = 0, search, isActive, sortBy = 'sortOrder', sortOrder = 'ASC' } = query;

        const [provinces, total] = await this.provinceRepository.findWithPagination(
            limit,
            offset,
            sortBy,
            sortOrder,
            { isActive, search }
        );

        return {
            provinces: provinces.map(province => this.mapProvinceToResponseDto(province)),
            total,
            limit,
            offset,
        };
    }

    // ========== DATALOADER INTEGRATION EXAMPLES ==========

    /**
     * Example: Get provinces with their wards using DataLoader
     * This solves N+1 query problem
     */
    async getProvincesWithWards(query: GetProvincesDto): Promise<GetProvincesResult> {
        const { limit = 10, offset = 0, search, isActive, sortBy = 'sortOrder', sortOrder = 'ASC' } = query;

        // Get provinces
        const [provinces, total] = await this.provinceRepository.findWithPagination(
            limit,
            offset,
            sortBy,
            sortOrder,
            { isActive, search }
        );

        // Create DataLoaders for this request
        const loaders = this.dataLoaderService.createLoaders();

        // Load wards for each province using DataLoader (batched)
        const provincesWithWards = await Promise.all(
            provinces.map(async (province) => {
                const wards = await loaders.wardsByProvinceLoader.load(province.id);
                return {
                    ...this.mapProvinceToResponseDto(province),
                    wards: wards.map(ward => ({
                        id: ward.id,
                        wardCode: ward.wardCode,
                        wardName: ward.wardName,
                        shortName: ward.shortName,
                        sortOrder: ward.sortOrder,
                        isActive: ward.isActive,
                    })),
                };
            })
        );

        return {
            provinces: provincesWithWards,
            total,
            limit,
            offset,
        };
    }

    /**
     * Example: Get provinces with branches using DataLoader
     */
    async getProvincesWithBranches(query: GetProvincesDto): Promise<GetProvincesResult> {
        const { limit = 10, offset = 0, search, isActive, sortBy = 'sortOrder', sortOrder = 'ASC' } = query;

        // Get provinces
        const [provinces, total] = await this.provinceRepository.findWithPagination(
            limit,
            offset,
            sortBy,
            sortOrder,
            { isActive, search }
        );

        // Create DataLoaders for this request
        const loaders = this.dataLoaderService.createLoaders();

        // Load branches for each province using DataLoader (batched)
        const provincesWithBranches = await Promise.all(
            provinces.map(async (province) => {
                const branches = await loaders.branchesByProvinceLoader.load(province.id);
                return {
                    ...this.mapProvinceToResponseDto(province),
                    branches: branches.map(branch => ({
                        id: branch.id,
                        branchCode: branch.branchCode,
                        branchName: branch.branchName,
                        shortName: branch.shortName,
                        hospitalLevel: branch.hospitalLevel,
                        isActive: branch.isActive,
                    })),
                };
            })
        );

        return {
            provinces: provincesWithBranches,
            total,
            limit,
            offset,
        };
    }

    // ========== STATISTICS ==========

    async getStatsOverview(): Promise<any> {
        // TODO: Implement stats overview
        return {
            total: 0,
            active: 0,
            inactive: 0,
        };
    }

    // ========== UTILITY METHODS ==========

    async reorderProvinces(provinceIds: string[]): Promise<void> {
        // TODO: Implement reorder provinces
        console.log('Reordering provinces:', provinceIds);
    }

    private async getNextSortOrder(): Promise<number> {
        return this.provinceRepository.getNextSortOrder();
    }

    private mapProvinceToResponseDto(province: Province): ProvinceResponseDto {
        return {
            id: province.id,
            provinceCode: province.provinceCode,
            provinceName: province.provinceName,
            shortName: province.shortName,
            sortOrder: province.sortOrder,
            isActive: province.isActive,
            version: province.version,
            displayName: province.getDisplayName(),
            createdAt: province.createdAt,
            updatedAt: province.updatedAt,
        };
    }
}