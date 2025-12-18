import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({
        description: 'Username for the user account',
        example: 'john_doe',
        minLength: 3,
        maxLength: 50
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    username: string;

    @ApiProperty({
        description: 'Email address of the user',
        example: 'john.doe@example.com',
        format: 'email'
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: 'Password for the user account',
        example: 'SecurePass123!',
        minLength: 8
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @ApiProperty({
        description: 'Full name of the user',
        example: 'John Doe',
        minLength: 2,
        maxLength: 100
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    fullName: string;
}
