import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class GetPatientsByCmndDto {
    @ApiProperty({ description: 'Số CMND/CCCD', example: '123456789' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^\d{9,12}$/, { message: 'CMND must be 9-12 digits' })
    cmndNumber: string;
}
