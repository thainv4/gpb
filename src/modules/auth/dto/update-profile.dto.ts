import { IsString, IsOptional, MinLength, MaxLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
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

    @ApiProperty({
        description: 'Phone number of the user',
        example: '+1234567890',
        required: false,
        maxLength: 20
    })
    @IsString()
    @IsOptional()
    @MaxLength(20)
    phoneNumber?: string;

    @ApiProperty({
        description: 'Address of the user',
        example: '123 Main St, City, Country',
        required: false,
        maxLength: 500
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    address?: string;
}
