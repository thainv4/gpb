import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../user/entities/user.entity';
import { IUserRepository } from '../../user/interfaces/user.repository.interface';

export interface JwtPayload {
    sub: string;
    username: string;
    email: string;
    iat?: number;
    exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject('IUserRepository')
        private readonly userRepository: IUserRepository,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'your-super-secret-key-here',
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const user = await this.userRepository.findById(payload.sub);
        if (!user || !user.isAccountActive()) {
            throw new UnauthorizedException('User not found or inactive');
        }
        return user;
    }
}
