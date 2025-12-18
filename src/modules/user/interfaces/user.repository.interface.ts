import { User } from '../entities/user.entity';

export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    findByIds(ids: string[]): Promise<User[]>;
    save(user: User): Promise<User>;
    delete(id: string): Promise<void>;
    findActiveUsers(limit: number, offset: number): Promise<[User[], number]>;
}
