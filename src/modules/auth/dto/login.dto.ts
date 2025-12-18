import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        description: 'Username of the user',
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
        description: 'Password for the user account',
        example: 'SecurePass123!',
        minLength: 8
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}
