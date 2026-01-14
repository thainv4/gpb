import { IsNotEmpty, IsOptional, IsString, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStoredServiceResultDto {
    @ApiProperty({ description: 'ID dịch vụ trong BML_STORED_SR_SERVICES', example: 'abc-123-def-456' })
    @IsNotEmpty({ message: 'ID dịch vụ là bắt buộc' })
    @IsString()
    storedSrServiceId: string;

    @ApiPropertyOptional({ description: 'Mô tả kết quả' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ description: 'Kết luận' })
    @IsOptional()
    @IsString()
    conclude?: string;

    @ApiPropertyOptional({ description: 'Ghi chú' })
    @IsOptional()
    @IsString()
    note?: string;
}
