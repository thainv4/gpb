import { IsString, IsOptional, MinLength, MaxLength, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiProperty({
        description: 'Full name of the user',
        example: 'John Doe',
        required: false,
        minLength: 2,
        maxLength: 100
    })
    @IsString()
    @IsOptional()
    @MinLength(2)
    @MaxLength(100)
    fullName?: string;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    phoneNumber?: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    address?: string;

    @ApiPropertyOptional({
        description: 'Role of the user',
        example: 'user',
        enum: ['admin', 'user']
    })
    @IsOptional()
    @IsString()
    @IsIn(['admin', 'user'], { message: 'Role must be either "admin" or "user"' })
    role?: 'admin' | 'user';
}
