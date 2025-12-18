import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchPatientsDto {
    @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm bệnh nhân', example: 'Nguyễn Văn A' })
    @IsOptional()
    @IsString()
    @MinLength(1)
    search?: string;

    @ApiPropertyOptional({ description: 'ID giới tính', example: 'M' })
    @IsOptional()
    @IsString()
    genderId?: string;

    @ApiPropertyOptional({ description: 'ID tỉnh', example: 'uuid-province-id' })
    @IsOptional()
    @IsString()
    provinceId?: string;

    @ApiPropertyOptional({ description: 'ID phường/xã', example: 'uuid-ward-id' })
    @IsOptional()
    @IsString()
    wardId?: string;

    @ApiPropertyOptional({ description: 'Số lượng kết quả tối đa', example: 50 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 50;
}
