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
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { email, deletedAt: IsNull() },
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

    async findActiveUsers(limit: number, offset: number): Promise<[User[], number]> {
        return this.userRepository.findAndCount({
            where: { isActive: true, deletedAt: IsNull() },
            take: limit,
            skip: offset,
            order: { createdAt: 'DESC' },
        });
    }
}
