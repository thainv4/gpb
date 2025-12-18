import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { IProfileRepository } from './interfaces/profile.repository.interface';
import { CreateProfileDto } from './dto/commands/create-profile.dto';
import { UpdateProfileDto } from './dto/commands/update-profile.dto';
import { GetProfilesDto } from './dto/queries/get-profiles.dto';
import { ProfileResponseDto } from './dto/responses/profile-response.dto';
import { GetProfilesResult } from './dto/responses/profiles-list-response.dto';
import { DataLoaderService } from '../../shared/dataloaders/dataloader.service';
import { AppError } from '../../common/errors/app.error';
import { BaseService } from '../../common/services/base.service';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { CurrentUser as ICurrentUser } from '../../common/interfaces/current-user.interface';

@Injectable()
export class ProfileService extends BaseService {
    constructor(
        @Inject('IProfileRepository')
        private readonly profileRepository: IProfileRepository,
        @Inject(DataSource)
        protected readonly dataSource: DataSource,
        @Inject(CurrentUserContextService)
        protected readonly currentUserContext: CurrentUserContextService,
        private readonly dataLoaderService: DataLoaderService,
    ) {
        super(dataSource, currentUserContext);
    }

    // ========== COMMANDS (Write Operations) ==========

    async createProfile(createDto: CreateProfileDto, currentUser: ICurrentUser): Promise<string> {
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            // Check if profile already exists for this user
            const exists = await this.profileRepository.existsByUserId(currentUser.id);
            if (exists) {
                throw AppError.conflict('Profile already exists for this user');
            }

            // Check if employee code is unique
            if (createDto.employeeCode) {
                const employeeExists = await this.profileRepository.existsByEmployeeCode(createDto.employeeCode);
                if (employeeExists) {
                    throw AppError.conflict('Employee code already exists');
                }
            }

            const profile = new Profile();
            profile.userId = currentUser.id;
            profile.provinceId = createDto.provinceId;
            profile.wardId = createDto.wardId;
            profile.address = createDto.address;
            profile.departmentId = createDto.departmentId;
            profile.position = createDto.position;
            profile.employeeCode = createDto.employeeCode;
            profile.phoneNumber = createDto.phoneNumber;
            profile.dateOfBirth = createDto.dateOfBirth ? new Date(createDto.dateOfBirth) : undefined;
            profile.gender = createDto.gender;
            profile.avatar = createDto.avatar;
            profile.mappedUsername = createDto.mappedUsername;
            profile.mappedPassword = createDto.mappedPassword;

            profile.createdBy = currentUser.id;
            profile.updatedBy = currentUser.id;

            const savedProfile = await manager.save(Profile, profile);
            return savedProfile.id;
        });
    }

    async updateProfile(userId: string, updateDto: UpdateProfileDto, currentUser: ICurrentUser): Promise<ProfileResponseDto> {
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            const profile = await this.profileRepository.findByUserId(userId);
            if (!profile) {
                throw AppError.notFound('Profile not found');
            }

            // Check if employee code is unique (if being updated)
            if (updateDto.employeeCode && updateDto.employeeCode !== profile.employeeCode) {
                const employeeExists = await this.profileRepository.existsByEmployeeCode(updateDto.employeeCode);
                if (employeeExists) {
                    throw AppError.conflict('Employee code already exists');
                }
            }

            // Update fields
            if (updateDto.provinceId !== undefined) profile.provinceId = updateDto.provinceId;
            if (updateDto.wardId !== undefined) profile.wardId = updateDto.wardId;
            if (updateDto.address !== undefined) profile.address = updateDto.address;
            if (updateDto.departmentId !== undefined) profile.departmentId = updateDto.departmentId;
            if (updateDto.position !== undefined) profile.position = updateDto.position;
            if (updateDto.employeeCode !== undefined) profile.employeeCode = updateDto.employeeCode;
            if (updateDto.phoneNumber !== undefined) profile.phoneNumber = updateDto.phoneNumber;
            if (updateDto.dateOfBirth !== undefined) {
                profile.dateOfBirth = updateDto.dateOfBirth ? new Date(updateDto.dateOfBirth) : undefined;
            }
            if (updateDto.gender !== undefined) profile.gender = updateDto.gender;
            if (updateDto.avatar !== undefined) profile.avatar = updateDto.avatar;
            if (updateDto.mappedUsername !== undefined) profile.mappedUsername = updateDto.mappedUsername;
            if (updateDto.mappedPassword !== undefined) profile.mappedPassword = updateDto.mappedPassword;

            profile.updatedBy = currentUser.id;

            const updatedProfile = await manager.save(Profile, profile);
            return this.mapProfileToResponseDto(updatedProfile);
        });
    }

    async deleteProfile(userId: string, currentUser: ICurrentUser): Promise<void> {
        this.currentUserContext.setCurrentUser(currentUser);

        return this.transactionWithAudit(async (manager) => {
            const profile = await this.profileRepository.findByUserId(userId);
            if (!profile) {
                throw AppError.notFound('Profile not found');
            }

            profile.deletedAt = new Date();
            profile.updatedBy = currentUser.id;

            await manager.save(Profile, profile);
        });
    }

    // ========== QUERIES (Read Operations) ==========

    async getProfileByUserId(userId: string): Promise<ProfileResponseDto> {
        const profile = await this.profileRepository.findWithRelations(userId);
        if (!profile) {
            throw AppError.notFound('Profile not found');
        }
        return this.mapProfileToResponseDto(profile);
    }

    async getProfileById(id: string): Promise<ProfileResponseDto> {
        const profile = await this.profileRepository.findById(id);
        if (!profile) {
            throw AppError.notFound('Profile not found');
        }
        return this.mapProfileToResponseDto(profile);
    }

    async getProfiles(query: GetProfilesDto): Promise<GetProfilesResult> {
        const { limit = 10, offset = 0, search, provinceId, wardId, departmentId, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

        const [profiles, total] = await this.profileRepository.findWithPagination(
            limit,
            offset,
            search,
            provinceId,
            wardId,
            departmentId,
            sortBy,
            sortOrder
        );

        return {
            profiles: profiles.map(profile => this.mapProfileToResponseDto(profile)),
            total,
            limit,
            offset,
        };
    }

    async getProfileByEmployeeCode(employeeCode: string): Promise<ProfileResponseDto> {
        const profile = await this.profileRepository.findByEmployeeCode(employeeCode);
        if (!profile) {
            throw AppError.notFound('Profile not found');
        }
        return this.mapProfileToResponseDto(profile);
    }

    async getProfileByPhoneNumber(phoneNumber: string): Promise<ProfileResponseDto> {
        const profile = await this.profileRepository.findByPhoneNumber(phoneNumber);
        if (!profile) {
            throw AppError.notFound('Profile not found');
        }
        return this.mapProfileToResponseDto(profile);
    }

    // ========== PRIVATE METHODS ==========

    private mapProfileToResponseDto(profile: Profile): ProfileResponseDto {
        return {
            id: profile.id,
            userId: profile.userId,
            provinceId: profile.provinceId,
            provinceName: profile.province?.provinceName,
            wardId: profile.wardId,
            wardName: profile.ward?.wardName,
            address: profile.address,
            fullAddress: profile.getFullAddress(),
            departmentId: profile.departmentId,
            departmentName: profile.department?.departmentName,
            position: profile.position,
            employeeCode: profile.employeeCode,
            workInfo: profile.getWorkInfo(),
            phoneNumber: profile.phoneNumber,
            dateOfBirth: profile.dateOfBirth,
            age: profile.getAge(),
            gender: profile.gender,
            avatar: profile.avatar,
            mappedUsername: profile.mappedUsername,
            hasMappedPassword: profile.hasMappingCredentials(),
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
            createdBy: profile.createdBy,
            updatedBy: profile.updatedBy,
            version: profile.version,
        };
    }
}
