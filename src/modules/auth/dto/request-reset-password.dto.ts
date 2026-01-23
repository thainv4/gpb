import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestResetPasswordDto {
    @ApiProperty({
        description: 'Email of the user (optional if username is provided)',
        example: 'user@example.com',
        required: false,
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({
        description: 'Username of the user (optional if email is provided)',
        example: 'john_doe',
        required: false,
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    username?: string;
}
