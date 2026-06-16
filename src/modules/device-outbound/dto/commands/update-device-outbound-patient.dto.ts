import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateDeviceOutboundPatientDto {
    @ApiProperty({ example: 'Nguyễn', maxLength: 100 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    patientFamily: string;

    @ApiProperty({ example: 'Văn A', maxLength: 100 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    patientGiven: string;

    @ApiProperty({ example: '1984-09-07', description: 'ISO date YYYY-MM-DD' })
    @IsDateString()
    patientDob: string;

    @ApiProperty({ example: 'M', enum: ['M', 'F'] })
    @IsIn(['M', 'F'])
    patientGender: 'M' | 'F';
}
