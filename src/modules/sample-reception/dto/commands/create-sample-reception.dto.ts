import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSampleReceptionDto {
    @ApiProperty({ description: 'Mã loại mẫu', example: 'BLOOD' })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    sampleTypeCode: string;
}
