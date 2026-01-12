import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class StartDto {
    @ApiProperty({ description: 'API Data (Accession Number)', example: '128565394' })
    @IsString()
    @IsNotEmpty()
    ApiData: string;
}
