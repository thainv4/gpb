import {
    Injectable,
    Inject,
    NotFoundException,
    ConflictException,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import { IBranchRepository } from './interfaces/branch.repository.interface';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto } from './dto/commands/create-branch.dto';
import { UpdateBranchDto } from './dto/commands/update-branch.dto';
import { GetBranchesDto } from './dto/queries/get-branches.dto';
import { SearchBranchesDto } from './dto/queries/search-branches.dto';
import { GetBranchesByProvinceDto } from './dto/queries/get-branches-by-province.dto';
import { GetBranchesByWardDto } from './dto/queries/get-branches-by-ward.dto';
import { BranchResponseDto } from './dto/responses/branch-response.dto';
import { BranchesListResponseDto } from './dto/responses/branches-list-response.dto';
import { BranchWithLocationResponseDto } from './dto/responses/branch-with-location-response.dto';
import { HospitalLevel } from './dto/commands/create-branch.dto';
import { BaseService } from '../../common/services/base.service';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';

@Injectable()
export class BranchService extends BaseService {
    constructor(
        @Inject('IBranchRepository')
        private readonly branchRepository: IBranchRepository,
        dataSource: any,
        currentUserContext: CurrentUserContextService,
    ) {
        super(dataSource, currentUserContext);
    }

    // ============================================================================================================
    // COMMANDS (WRITE OPERATIONS)
    // ============================================================================================================

    async createBranch(createBranchDto: CreateBranchDto, createdBy: string): Promise<BranchResponseDto> {
        try {
            // Validate province and ward exist
            await this.validateProvinceAndWard(createBranchDto.provinceId, createBranchDto.wardId);

            // Generate branch code if not provided
            if (!createBranchDto.branchCode) {
                createBranchDto.branchCode = await this.generateBranchCode(createBranchDto.provinceId);
            }

            // Check for existing branch code
            const existingBranch = await this.branchRepository.findByCode(createBranchDto.branchCode);
            if (existingBranch) {
                throw new ConflictException(`Chi nhánh với mã '${createBranchDto.branchCode}' đã tồn tại`);
            }

            // Check for existing branch name in province
            const existingNameInProvince = await this.branchRepository.existsByNameInProvince(
                createBranchDto.branchName,
                createBranchDto.provinceId
            );
            if (existingNameInProvince) {
                throw new ConflictException(`Chi nhánh với tên '${createBranchDto.branchName}' đã tồn tại trong tỉnh này`);
            }

            // Check for existing BHYT code
            const existingBhyCode = await this.branchRepository.existsByBhyCode(createBranchDto.bhyCode);
            if (existingBhyCode) {
                throw new ConflictException(`Chi nhánh với mã BHYT '${createBranchDto.bhyCode}' đã tồn tại`);
            }

            // Check for existing phone number
            const existingPhone = await this.branchRepository.existsByPhoneNumber(createBranchDto.phoneNumber);
            if (existingPhone) {
                throw new ConflictException(`Chi nhánh với số điện thoại '${createBranchDto.phoneNumber}' đã tồn tại`);
            }

            // Create new branch
            const branch = new Branch();
            branch.branchCode = createBranchDto.branchCode;
            branch.branchName = createBranchDto.branchName;
            branch.shortName = createBranchDto.shortName;
            branch.provinceId = createBranchDto.provinceId;
            branch.wardId = createBranchDto.wardId;
            branch.address = createBranchDto.address;
            branch.phoneNumber = createBranchDto.phoneNumber;
            branch.hospitalLevel = createBranchDto.hospitalLevel;
            branch.representative = createBranchDto.representative;
            branch.bhyCode = createBranchDto.bhyCode;
            branch.isActive = createBranchDto.isActive ?? true;
            branch.createdBy = createdBy;
            branch.updatedBy = createdBy;

            const savedBranch = await this.branchRepository.save(branch);
            return this.mapBranchToResponseDto(savedBranch);
        } catch (error) {
            if (error instanceof ConflictException || error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Lỗi khi tạo chi nhánh mới');
        }
    }

    async updateBranch(id: string, updateBranchDto: UpdateBranchDto, updatedBy: string): Promise<BranchResponseDto> {
        try {
            const branch = await this.branchRepository.findById(id);
            if (!branch) {
                throw new NotFoundException(`Chi nhánh với ID '${id}' không tồn tại`);
            }

            // Validate province and ward if provided
            if (updateBranchDto.provinceId) {
                await this.validateProvinceAndWard(updateBranchDto.provinceId, updateBranchDto.wardId || branch.wardId);
            }

            // Check for existing branch code
            if (updateBranchDto.branchCode && updateBranchDto.branchCode !== branch.branchCode) {
                const existingBranch = await this.branchRepository.findByCode(updateBranchDto.branchCode);
                if (existingBranch) {
                    throw new ConflictException(`Chi nhánh với mã '${updateBranchDto.branchCode}' đã tồn tại`);
                }
            }

            // Check for existing branch name in province
            if (updateBranchDto.branchName && updateBranchDto.branchName !== branch.branchName) {
                const provinceId = updateBranchDto.provinceId || branch.provinceId;
                const existingNameInProvince = await this.branchRepository.existsByNameInProvince(
                    updateBranchDto.branchName,
                    provinceId,
                    id
                );
                if (existingNameInProvince) {
                    throw new ConflictException(`Chi nhánh với tên '${updateBranchDto.branchName}' đã tồn tại trong tỉnh này`);
                }
            }

            // Check for existing BHYT code
            if (updateBranchDto.bhyCode && updateBranchDto.bhyCode !== branch.bhyCode) {
                const existingBhyCode = await this.branchRepository.existsByBhyCode(updateBranchDto.bhyCode, id);
                if (existingBhyCode) {
                    throw new ConflictException(`Chi nhánh với mã BHYT '${updateBranchDto.bhyCode}' đã tồn tại`);
                }
            }

            // Check for existing phone number
            if (updateBranchDto.phoneNumber && updateBranchDto.phoneNumber !== branch.phoneNumber) {
                const existingPhone = await this.branchRepository.existsByPhoneNumber(updateBranchDto.phoneNumber, id);
                if (existingPhone) {
                    throw new ConflictException(`Chi nhánh với số điện thoại '${updateBranchDto.phoneNumber}' đã tồn tại`);
                }
            }

            // Update branch fields
            if (updateBranchDto.branchCode !== undefined) branch.branchCode = updateBranchDto.branchCode;
            if (updateBranchDto.branchName !== undefined) branch.branchName = updateBranchDto.branchName;
            if (updateBranchDto.shortName !== undefined) branch.shortName = updateBranchDto.shortName;
            if (updateBranchDto.provinceId !== undefined) branch.provinceId = updateBranchDto.provinceId;
            if (updateBranchDto.wardId !== undefined) branch.wardId = updateBranchDto.wardId;
            if (updateBranchDto.address !== undefined) branch.address = updateBranchDto.address;
            if (updateBranchDto.phoneNumber !== undefined) branch.phoneNumber = updateBranchDto.phoneNumber;
            if (updateBranchDto.hospitalLevel !== undefined) branch.hospitalLevel = updateBranchDto.hospitalLevel;
            if (updateBranchDto.representative !== undefined) branch.representative = updateBranchDto.representative;
            if (updateBranchDto.bhyCode !== undefined) branch.bhyCode = updateBranchDto.bhyCode;
            if (updateBranchDto.isActive !== undefined) branch.isActive = updateBranchDto.isActive;
            branch.updatedBy = updatedBy;

            const updatedBranch = await this.branchRepository.save(branch);
            return this.mapBranchToResponseDto(updatedBranch);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Lỗi khi cập nhật chi nhánh');
        }
    }

    async deleteBranch(id: string, deletedBy: string): Promise<void> {
        try {
            const branch = await this.branchRepository.findById(id);
            if (!branch) {
                throw new NotFoundException(`Chi nhánh với ID '${id}' không tồn tại`);
            }

            await this.branchRepository.softDelete(id);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Lỗi khi xóa chi nhánh');
        }
    }

    async hardDeleteBranch(id: string): Promise<void> {
        try {
            const branch = await this.branchRepository.findById(id);
            if (!branch) {
                throw new NotFoundException(`Chi nhánh với ID '${id}' không tồn tại`);
            }

            await this.branchRepository.delete(id);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Lỗi khi xóa cứng chi nhánh');
        }
    }

    // ============================================================================================================
    // QUERIES (READ OPERATIONS)
    // ============================================================================================================

    async getBranches(getBranchesDto: GetBranchesDto): Promise<BranchesListResponseDto> {
        try {
            const { limit = 10, offset = 0, sortBy, sortOrder, isActive, search, provinceId, wardId, hospitalLevel } = getBranchesDto;

            const [branches, total] = await this.branchRepository.findWithPagination(
                limit,
                offset,
                sortBy,
                sortOrder,
                {
                    isActive,
                    search,
                    provinceId,
                    wardId,
                    hospitalLevel,
                }
            );

            const branchResponses = branches.map(branch => this.mapBranchToResponseDto(branch));

            return {
                branches: branchResponses,
                pagination: {
                    total,
                    limit,
                    offset,
                    page: Math.floor(offset / limit) + 1,
                    totalPages: Math.ceil(total / limit),
                    hasNext: offset + limit < total,
                    hasPrev: offset > 0,
                },
            };
        } catch (error) {
            throw new InternalServerErrorException('Lỗi khi lấy danh sách chi nhánh');
        }
    }

    async getBranchById(id: string): Promise<BranchResponseDto> {
        try {
            const branch = await this.branchRepository.findById(id);
            if (!branch) {
                throw new NotFoundException(`Chi nhánh với ID '${id}' không tồn tại`);
            }

            return this.mapBranchToResponseDto(branch);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Lỗi khi lấy thông tin chi nhánh');
        }
    }

    async searchBranches(searchBranchesDto: SearchBranchesDto): Promise<BranchesListResponseDto> {
        try {
            const { keyword, searchType, provinceId, wardId, hospitalLevel, limit = 10, offset = 0, sortBy, sortOrder } = searchBranchesDto;

            let branches: Branch[] = [];

            switch (searchType) {
                case 'name':
                    branches = await this.branchRepository.searchByName(keyword);
                    break;
                case 'code':
                    branches = await this.branchRepository.searchByCode(keyword);
                    break;
                case 'shortName':
                    branches = await this.branchRepository.searchByShortName(keyword);
                    break;
                case 'address':
                    branches = await this.branchRepository.searchByAddress(keyword);
                    break;
                case 'phone':
                    branches = await this.branchRepository.searchByPhoneNumber(keyword);
                    break;
                case 'representative':
                    branches = await this.branchRepository.searchByRepresentative(keyword);
                    break;
                case 'bhy':
                    branches = await this.branchRepository.searchByBhyCode(keyword);
                    break;
                case 'hospitalLevel':
                    branches = await this.branchRepository.searchByHospitalLevel(keyword);
                    break;
                case 'all':
                default:
                    if (provinceId) {
                        branches = await this.branchRepository.searchByProvinceAndKeyword(provinceId, keyword);
                    } else if (wardId) {
                        branches = await this.branchRepository.searchByWardAndKeyword(wardId, keyword);
                    } else {
                        branches = await this.branchRepository.searchByKeyword(keyword);
                    }
                    break;
            }

            // Apply additional filters
            if (hospitalLevel) {
                branches = branches.filter(branch => branch.hospitalLevel === hospitalLevel);
            }

            // Apply pagination
            const total = branches.length;
            const paginatedBranches = branches.slice(offset, offset + limit);

            const branchResponses = paginatedBranches.map(branch => this.mapBranchToResponseDto(branch));

            return {
                branches: branchResponses,
                pagination: {
                    total,
                    limit,
                    offset,
                    page: Math.floor(offset / limit) + 1,
                    totalPages: Math.ceil(total / limit),
                    hasNext: offset + limit < total,
                    hasPrev: offset > 0,
                },
            };
        } catch (error) {
            throw new InternalServerErrorException('Lỗi khi tìm kiếm chi nhánh');
        }
    }

    async getBranchesByProvince(getBranchesByProvinceDto: GetBranchesByProvinceDto): Promise<BranchesListResponseDto> {
        try {
            const { provinceId, limit = 10, offset = 0, sortBy, sortOrder, isActive, hospitalLevel, search } = getBranchesByProvinceDto;

            const [branches, total] = await this.branchRepository.findWithPagination(
                limit,
                offset,
                sortBy,
                sortOrder,
                {
                    isActive,
                    search,
                    provinceId,
                    hospitalLevel,
                }
            );

            const branchResponses = branches.map(branch => this.mapBranchToResponseDto(branch));

            return {
                branches: branchResponses,
                pagination: {
                    total,
                    limit,
                    offset,
                    page: Math.floor(offset / limit) + 1,
                    totalPages: Math.ceil(total / limit),
                    hasNext: offset + limit < total,
                    hasPrev: offset > 0,
                },
            };
        } catch (error) {
            throw new InternalServerErrorException('Lỗi khi lấy chi nhánh theo tỉnh');
        }
    }

    async getBranchesByWard(getBranchesByWardDto: GetBranchesByWardDto): Promise<BranchesListResponseDto> {
        try {
            const { wardId, limit = 10, offset = 0, sortBy, sortOrder, isActive, hospitalLevel, search } = getBranchesByWardDto;

            const [branches, total] = await this.branchRepository.findWithPagination(
                limit,
                offset,
                sortBy,
                sortOrder,
                {
                    isActive,
                    search,
                    wardId,
                    hospitalLevel,
                }
            );

            const branchResponses = branches.map(branch => this.mapBranchToResponseDto(branch));

            return {
                branches: branchResponses,
                pagination: {
                    total,
                    limit,
                    offset,
                    page: Math.floor(offset / limit) + 1,
                    totalPages: Math.ceil(total / limit),
                    hasNext: offset + limit < total,
                    hasPrev: offset > 0,
                },
            };
        } catch (error) {
            throw new InternalServerErrorException('Lỗi khi lấy chi nhánh theo xã');
        }
    }

    async getBranchStats(): Promise<any> {
        try {
            const totalBranches = await this.branchRepository.countTotal();
            const activeBranches = await this.branchRepository.countActive();
            const inactiveBranches = await this.branchRepository.countInactive();

            // Get branches by hospital level
            const branchesByLevel = {};
            for (const level of Object.values(HospitalLevel)) {
                branchesByLevel[level] = await this.branchRepository.countByHospitalLevel(level);
            }

            return {
                totalBranches,
                activeBranches,
                inactiveBranches,
                softDeletedBranches: totalBranches - activeBranches - inactiveBranches,
                branchesByLevel,
            };
        } catch (error) {
            throw new InternalServerErrorException('Lỗi khi lấy thống kê chi nhánh');
        }
    }

    // ============================================================================================================
    // PRIVATE METHODS
    // ============================================================================================================

    private async validateProvinceAndWard(provinceId: string, wardId: string): Promise<void> {
        // This would typically validate that province and ward exist
        // For now, we'll assume they exist
        // In a real implementation, you would inject ProvinceService and WardService
        // and validate the IDs
    }

    private async generateBranchCode(provinceId: string): Promise<string> {
        // This would typically get the province code and generate a unique branch code
        // For now, we'll generate a simple code
        // In a real implementation, you would get the province code and generate the next number
        return `BR${Date.now().toString().slice(-3)}`;
    }

    private mapBranchToResponseDto(branch: Branch): BranchResponseDto {
        return {
            id: branch.id,
            branchCode: branch.branchCode,
            branchName: branch.branchName,
            shortName: branch.shortName,
            provinceId: branch.provinceId,
            wardId: branch.wardId,
            address: branch.address,
            phoneNumber: branch.phoneNumber,
            hospitalLevel: branch.hospitalLevel as HospitalLevel,
            representative: branch.representative,
            bhyCode: branch.bhyCode,
            isActive: branch.isActive,
            createdAt: branch.createdAt,
            updatedAt: branch.updatedAt,
            createdBy: branch.createdBy,
            updatedBy: branch.updatedBy,
            version: branch.version,
            displayName: branch.getDisplayName(),
            fullAddress: branch.getFullAddress(),
            province: branch.province ? {
                id: branch.province.id,
                provinceCode: branch.province.provinceCode,
                provinceName: branch.province.provinceName,
                shortName: branch.province.shortName,
            } : undefined,
            ward: branch.ward ? {
                id: branch.ward.id,
                wardCode: branch.ward.wardCode,
                wardName: branch.ward.wardName,
                shortName: branch.ward.shortName,
            } : undefined,
        };
    }
}
