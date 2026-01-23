import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @ApiProperty({
        description: 'Username of the user to reset password',
        example: 'john_doe',
    })
    @IsString()
    @IsNotEmpty()
    username: string;
}
