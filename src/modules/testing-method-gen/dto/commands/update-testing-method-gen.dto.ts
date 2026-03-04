import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTestingMethodGenDto {
    @ApiPropertyOptional({ description: 'Tên phương pháp xét nghiệm', example: 'Venipuncture', maxLength: 50 })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    methodName?: string;
}
