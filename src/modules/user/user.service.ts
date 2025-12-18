import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { IUserRepository } from './interfaces/user.repository.interface';
import { CreateUserDto } from './dto/commands/create-user.dto';
import { UpdateUserDto } from './dto/commands/update-user.dto';
import { GetUsersDto } from './dto/queries/get-users.dto';
import { UserResponseDto } from './dto/responses/user-response.dto';
import { PasswordService } from '../../shared/services/password.service';
import { AppError } from '../../common/errors/app.error';
import { BaseService } from '../../common/services/base.service';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';

export interface CurrentUser {
    id: string;
    username: string;
    email: string;
}

export interface GetUsersResult {
    users: UserResponseDto[];
    total: number;
    limit: number;
    offset: number;
}

@Injectable()
export class UserService extends BaseService {
    constructor(
        @Inject('IUserRepository')
        private readonly userRepository: IUserRepository,
        dataSource: DataSource,
        private readonly passwordService: PasswordService,
        currentUserContext: CurrentUserContextService,
    ) {
        super(dataSource, currentUserContext);
    }

    // ========== COMMANDS (Write Operations) ==========

    async createUser(createUserDto: CreateUserDto, currentUser: CurrentUser): Promise<string> {
        // Set current user context for automatic audit
        this.currentUserContext.setCurrentUser(currentUser);
        
        return this.transactionWithAudit(async (manager) => {
            // Check if user already exists
            const existingUser = await this.userRepository.findByEmail(createUserDto.email);
            if (existingUser) {
                throw new ConflictException('User with this email already exists');
            }

            // Create user
            const user = new User();
            user.username = createUserDto.username;
            user.email = createUserDto.email;
            user.passwordHash = await this.passwordService.hashPassword(createUserDto.password);
            user.fullName = createUserDto.fullName;
            user.phoneNumber = createUserDto.phoneNumber;
            user.address = createUserDto.address;

            // ✅ Automatic audit fields - no manual assignment needed!
            this.setAuditFields(user, false); // false = create operation

            const savedUser = await manager.save(User, user);
            return savedUser.id;
        });
    }

    async updateUser(id: string, updateUserDto: UpdateUserDto, currentUser: CurrentUser): Promise<void> {
        // Set current user context for automatic audit
        this.currentUserContext.setCurrentUser(currentUser);
        
        return this.transactionWithAudit(async (manager) => {
            const user = await this.userRepository.findById(id);
            if (!user) {
                throw new NotFoundException('User not found');
            }

            // Update user fields
            Object.assign(user, updateUserDto);
            
            // ✅ Automatic audit fields - no manual assignment needed!
            this.setAuditFields(user, true); // true = update operation

            await manager.save(User, user);
        });
    }

    async deleteUser(id: string): Promise<void> {
        return this.dataSource.transaction(async (manager) => {
            const user = await this.userRepository.findById(id);
            if (!user) {
                throw new NotFoundException('User not found');
            }

            await this.userRepository.delete(id);
        });
    }

    async activateUser(id: string): Promise<void> {
        return this.dataSource.transaction(async (manager) => {
            const user = await this.userRepository.findById(id);
            if (!user) {
                throw new NotFoundException('User not found');
            }

            user.isActive = true;
            await manager.save(User, user);
        });
    }

    // ========== QUERIES (Read Operations) ==========

    async getUserById(id: string): Promise<UserResponseDto> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.mapUserToResponseDto(user);
    }

    async getUsers(query: GetUsersDto): Promise<GetUsersResult> {
        const { limit = 10, offset = 0, search, status } = query;

        // For now, use simple repository method
        // TODO: Implement query builder when needed
        const [users, total] = await this.userRepository.findActiveUsers(limit, offset);

        return {
            users: users.map(user => this.mapUserToResponseDto(user)),
            total,
            limit,
            offset,
        };
    }

    async findUserByEmail(email: string): Promise<UserResponseDto | null> {
        const user = await this.userRepository.findByEmail(email);
        return user ? this.mapUserToResponseDto(user) : null;
    }

    // ========== PRIVATE METHODS ==========


    private mapUserToResponseDto(user: User): UserResponseDto {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            isActive: user.isActive,
            phoneNumber: user.phoneNumber,
            dateOfBirth: user.dateOfBirth,
            address: user.address,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
