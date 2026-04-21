import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDeviceStainingMethodDto {
    @ApiPropertyOptional({ description: 'Tên phương pháp nhuộm (thiết bị)', example: 'Gram Stain' })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    methodName?: string;
}
