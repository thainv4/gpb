import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the user',
        example: 'user-uuid-here'
    })
    id: string;

    @ApiProperty({
        description: 'Username of the user',
        example: 'john_doe'
    })
    username: string;

    @ApiProperty({
        description: 'Email address of the user',
        example: 'john.doe@example.com'
    })
    email: string;

    @ApiProperty({
        description: 'Full name of the user',
        example: 'John Doe'
    })
    fullName: string;

    @ApiProperty({
        description: 'Whether the user account is active',
        example: true
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Phone number of the user',
        example: '+1234567890',
        required: false
    })
    phoneNumber?: string;

    @ApiProperty({
        description: 'Date of birth of the user',
        example: '1990-01-15T00:00:00.000Z',
        required: false
    })
    dateOfBirth?: Date;

    @ApiProperty({
        description: 'Address of the user',
        example: '123 Main St, City, Country',
        required: false
    })
    address?: string;

    @ApiProperty({
        description: 'Account creation timestamp',
        example: '2024-01-15T10:30:00.000Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2024-01-15T10:30:00.000Z'
    })
    updatedAt: Date;
}
