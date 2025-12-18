import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
