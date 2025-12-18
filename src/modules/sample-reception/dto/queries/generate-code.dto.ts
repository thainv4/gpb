import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, IsDateString } from 'class-validator';

export class GenerateCodeDto {
    @ApiProperty({ description: 'Mã loại mẫu', example: 'BLOOD' })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    sampleTypeCode: string;

    @ApiPropertyOptional({ description: 'Ngày sinh mã (YYYY-MM-DD)', example: '2024-10-24' })
    @IsOptional()
    @IsDateString()
    date?: string;
}
