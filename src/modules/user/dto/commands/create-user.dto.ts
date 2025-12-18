import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({
        description: 'Username for the user',
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
        example: 'john.doe@example.com'
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

    @ApiProperty({
        description: 'Phone number of the user',
        example: '+1234567890',
        required: false,
        maxLength: 20
    })
    @IsString()
    @MaxLength(20)
    phoneNumber?: string;

    @ApiProperty({
        description: 'Address of the user',
        example: '123 Main St, City, Country',
        required: false,
        maxLength: 500
    })
    @IsString()
    @MaxLength(500)
    address?: string;
}
