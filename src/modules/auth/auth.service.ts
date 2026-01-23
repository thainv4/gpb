import { Injectable, Inject, UnauthorizedException, ConflictException, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { IUserRepository } from '../user/interfaces/user.repository.interface';
import { IProfileRepository } from '../profile/interfaces/profile.repository.interface';
import { User } from '../user/entities/user.entity';
import { Profile } from '../profile/entities/profile.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterWithProfileDto } from './dto/register-with-profile.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { PasswordService } from '../../shared/services/password.service';
import { HisIntegrationService } from '../../shared/services/his-integration.service';
import { ProfileService } from '../profile/profile.service';
import { CurrentUser } from '../../common/interfaces/current-user.interface';
import { AppError } from '../../common/errors/app.error';

@Injectable()
export class AuthService {
    constructor(
        @Inject('IUserRepository')
        private readonly userRepository: IUserRepository,
        @Inject('IProfileRepository')
        private readonly profileRepository: IProfileRepository,
        private readonly jwtService: JwtService,
        private readonly passwordService: PasswordService,
        private readonly hisIntegrationService: HisIntegrationService,
        @InjectDataSource()
        private readonly dataSource: DataSource,
        @Inject(forwardRef(() => ProfileService))
        private readonly profileService: ProfileService,
    ) { }

    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        const user = await this.userRepository.findByUsername(loginDto.username);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await this.passwordService.verifyPassword(loginDto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw AppError.unauthorized('Invalid credentials');
        }

        if (!user.isAccountActive()) {
            throw new UnauthorizedException('Account is inactive');
        }

        const tokens = await this.generateTokens(user);
        const userResponse = this.mapUserToResponseDto(user);

        // Try to get user profile for HIS integration
        let hisData = null;
        try {
            // User already loaded with profile relationship
            if (user?.profile?.mappedUsername && user?.profile?.mappedPassword) {
                console.log('Attempting HIS login with credentials:', user.profile.mappedUsername);
                hisData = await this.hisIntegrationService.loginWithHis(
                    user.profile.mappedUsername,
                    user.profile.mappedPassword
                );
                console.log('HIS login successful:', hisData?.Data?.TokenCode);
            } else {
                console.log('No HIS credentials found in user profile');
            }
        } catch (error) {
            // Log error but don't fail login
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('HIS integration failed:', errorMessage);
        }

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: userResponse,
            hisTokenCode: hisData?.Data?.TokenCode || null,
            hisRenewCode: hisData?.Data?.RenewCode || null,
            hisUserInfo: hisData?.Data?.User ? {
                loginName: hisData.Data.User.LoginName,
                userName: hisData.Data.User.UserName,
                applicationCode: hisData.Data.User.ApplicationCode,
                gCode: hisData.Data.User.GCode,
                email: hisData.Data.User.Email,
                mobile: hisData.Data.User.Mobile,
            } : null,
            hisSessionInfo: hisData?.Data ? {
                validAddress: hisData.Data.ValidAddress,
                loginTime: hisData.Data.LoginTime,
                expireTime: hisData.Data.ExpireTime,
                loginAddress: hisData.Data.LoginAddress,
            } : null,
            hisRoles: hisData?.Data?.RoleDatas || null,
        };
    }

    async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
        // Validate password strength
        const passwordValidation = this.passwordService.validatePasswordStrength(registerDto.password);
        if (!passwordValidation.isValid) {
            throw AppError.passwordStrengthError(passwordValidation.errors);
        }

        // Check if user already exists
        const existingUser = await this.userRepository.findByEmail(registerDto.email);
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await this.passwordService.hashPassword(registerDto.password);

        // Create user
        const user = new User();
        user.username = registerDto.username;
        user.email = registerDto.email;
        user.passwordHash = hashedPassword;
        user.fullName = registerDto.fullName;

        const savedUser = await this.userRepository.save(user);

        // Generate tokens
        const tokens = await this.generateTokens(savedUser);
        const userResponse = this.mapUserToResponseDto(savedUser);

        return {
            ...tokens,
            user: userResponse,
        };
    }

    async registerWithProfile(
        registerDto: RegisterWithProfileDto,
        currentUser: CurrentUser | null,
    ): Promise<AuthResponseDto> {
        // Sử dụng transaction để đảm bảo atomicity
        return this.dataSource.transaction(async (manager) => {
            // 1. Validate password strength
            const passwordValidation = this.passwordService.validatePasswordStrength(registerDto.password);
            if (!passwordValidation.isValid) {
                throw AppError.passwordStrengthError(passwordValidation.errors);
            }

            // 2. Check if user already exists by email (only if email is provided)
            if (registerDto.email) {
                const existingUser = await this.userRepository.findByEmail(registerDto.email);
                if (existingUser) {
                    throw new ConflictException('User with this email already exists');
                }
            }

            // 3. Check if employee code is unique (if provided)
            if (registerDto.employeeCode) {
                const profileRepo = manager.getRepository(Profile);
                const existingProfile = await profileRepo.findOne({
                    where: { employeeCode: registerDto.employeeCode, deletedAt: null },
                });
                if (existingProfile) {
                    throw AppError.conflict('Employee code already exists');
                }
            }

            // 4. Hash password
            const hashedPassword = await this.passwordService.hashPassword(registerDto.password);

            // 5. Create user
            const user = new User();
            user.username = registerDto.username;
            user.email = registerDto.email;
            user.passwordHash = hashedPassword;
            user.fullName = registerDto.fullName;
            
            // Set audit fields only if currentUser is provided
            if (currentUser) {
                user.createdBy = currentUser.id;
                user.updatedBy = currentUser.id;
            }

            const savedUser = await manager.save(User, user);

            // 6. Create profile (trong cùng transaction)
            const profile = new Profile();
            profile.userId = savedUser.id;
            profile.departmentId = registerDto.departmentId;
            profile.position = registerDto.position;
            profile.employeeCode = registerDto.employeeCode;
            profile.phoneNumber = registerDto.phoneNumber;
            profile.dateOfBirth = registerDto.dateOfBirth ? new Date(registerDto.dateOfBirth) : undefined;
            profile.gender = registerDto.gender;
            profile.mappedUsername = registerDto.mappedUsername;
            profile.mappedPassword = registerDto.mappedPassword;
            
            // Set audit fields only if currentUser is provided
            if (currentUser) {
                profile.createdBy = currentUser.id;
                profile.updatedBy = currentUser.id;
            }

            await manager.save(Profile, profile);

            // 7. Generate tokens
            const tokens = await this.generateTokens(savedUser);
            const userResponse = this.mapUserToResponseDto(savedUser);

            return {
                ...tokens,
                user: userResponse,
            };
        });
    }

    private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
        const payload = {
            sub: user.id,
            username: user.username,
            email: user.email,
        };

        const accessToken = this.jwtService.sign(payload, {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
        });

        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        });

        return { accessToken, refreshToken };
    }


    // ========== PHASE 1 METHODS ==========

    async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string }> {
        try {
            // Verify refresh token
            const payload = this.jwtService.verify(refreshTokenDto.refreshToken);

            // Get user from database
            const user = await this.userRepository.findById(payload.sub);
            if (!user || !user.isAccountActive()) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            // Generate new tokens
            const tokens = await this.generateTokens(user);
            return tokens;
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async logout(userId: string): Promise<{ message: string }> {
        // In a real application, you would:
        // 1. Add the token to a blacklist
        // 2. Remove from active sessions
        // 3. Log the logout event

        // For now, just return success message
        return { message: 'Logged out successfully' };
    }

    async getProfile(userId: string): Promise<ProfileResponseDto> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.mapUserToProfileDto(user);
    }

    async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<ProfileResponseDto> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Update user fields
        if (updateProfileDto.fullName !== undefined) {
            user.fullName = updateProfileDto.fullName;
        }
        if (updateProfileDto.phoneNumber !== undefined) {
            user.phoneNumber = updateProfileDto.phoneNumber;
        }
        if (updateProfileDto.address !== undefined) {
            user.address = updateProfileDto.address;
        }

        // Save updated user
        const updatedUser = await this.userRepository.save(user);
        return this.mapUserToProfileDto(updatedUser);
    }

    // ========== COMMANDS (Write Operations) ==========

    async changePassword(
        userId: string,
        changePasswordDto: ChangePasswordDto,
        currentUser: CurrentUser,
    ): Promise<void> {
        return this.dataSource.transaction(async (manager) => {
            // 1. Get user
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new NotFoundException('User not found');
            }

            // 2. Verify current password
            const isCurrentPasswordValid = await this.passwordService.verifyPassword(
                changePasswordDto.currentPassword,
                user.passwordHash,
            );
            if (!isCurrentPasswordValid) {
                throw AppError.unauthorized('Mật khẩu hiện tại không chính xác');
            }

            // 3. Validate new password strength
            const passwordValidation = this.passwordService.validatePasswordStrength(changePasswordDto.newPassword);
            if (!passwordValidation.isValid) {
                throw AppError.passwordStrengthError(passwordValidation.errors);
            }

            // 4. Hash new password
            const hashedNewPassword = await this.passwordService.hashPassword(changePasswordDto.newPassword);

            // 5. Update User password
            user.passwordHash = hashedNewPassword;
            user.updatedBy = currentUser.id;
            await manager.save(User, user);

            // 6. Update Profile mappedPassword if profile exists
            const profile = await this.profileRepository.findByUserId(userId);
            if (profile) {
                profile.mappedPassword = changePasswordDto.newPassword; // Store plain text for HIS integration
                profile.updatedBy = currentUser.id;
                await manager.save(Profile, profile);
            }
        });
    }

    // ========== PRIVATE METHODS ==========

    private mapUserToResponseDto(user: User): any {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            isActive: user.isActive,
            role: user.role,
        };
    }

    private mapUserToProfileDto(user: User): ProfileResponseDto {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            address: user.address,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
