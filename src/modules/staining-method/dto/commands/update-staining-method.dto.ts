import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateStainingMethodDto {
    @ApiPropertyOptional({ description: 'Tên phương pháp nhuộm', example: 'Gram Stain' })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    methodName?: string;
}
