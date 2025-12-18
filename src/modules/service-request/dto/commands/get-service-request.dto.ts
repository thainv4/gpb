import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetServiceRequestDto {
    @ApiPropertyOptional({ description: 'ID yêu cầu dịch vụ', example: 55537570 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    id?: number;

    @ApiPropertyOptional({ description: 'Mã yêu cầu dịch vụ', example: '000055537395' })
    @IsOptional()
    @IsString()
    serviceReqCode?: string;
}
