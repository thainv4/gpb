import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
import { User } from './entities/user.entity';
import { IUserRepository } from './interfaces/user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async findById(id: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { id, deletedAt: IsNull() },
            relations: ['profile', 'profile.department'],
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { email, deletedAt: IsNull() },
            relations: ['profile', 'profile.department'],
        });
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { username, deletedAt: IsNull() },
            relations: ['profile'],
        });
    }

    async save(user: User): Promise<User> {
        return this.userRepository.save(user);
    }

    async delete(id: string): Promise<void> {
        await this.userRepository.softDelete(id);
    }

    async findByIds(ids: string[]): Promise<User[]> {
        return this.userRepository.find({
            where: { id: In(ids), deletedAt: IsNull() },
        });
    }

    async findActiveUsers(
        limit: number,
        offset: number,
        departmentId?: string,
        search?: string,
    ): Promise<[User[], number]> {
        const useFilters = !!departmentId || !!search?.trim();
        if (useFilters) {
            const qb = this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.profile', 'profile')
                .leftJoinAndSelect('profile.department', 'department')
                .where('user.isActive = :isActive', { isActive: true })
                .andWhere('user.deletedAt IS NULL')
                .orderBy('user.createdAt', 'DESC')
                .take(limit)
                .skip(offset);
            if (departmentId) {
                qb.andWhere('profile.departmentId = :departmentId', { departmentId });
            }
            if (search?.trim()) {
                const searchPattern = `%${search.trim()}%`;
                qb.andWhere(
                    '(LOWER(user.fullName) LIKE LOWER(:searchPattern) OR LOWER(user.username) LIKE LOWER(:searchPattern))',
                    { searchPattern },
                );
            }
            return qb.getManyAndCount();
        }
        return this.userRepository.findAndCount({
            where: { isActive: true, deletedAt: IsNull() },
            relations: ['profile', 'profile.department'],
            take: limit,
            skip: offset,
            order: { createdAt: 'DESC' },
        });
    }
}
