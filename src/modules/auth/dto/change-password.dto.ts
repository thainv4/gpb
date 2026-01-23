import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
    @ApiProperty({
        description: 'Current password of the user',
        example: 'OldPassword123!',
    })
    @IsString()
    @IsNotEmpty()
    currentPassword: string;

    @ApiProperty({
        description: 'New password for the user account',
        example: 'NewSecurePass123!',
    })
    @IsString()
    @IsNotEmpty()
    newPassword: string;
}
