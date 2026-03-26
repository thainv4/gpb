import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdatePivkaIiResultDto {
    @ApiPropertyOptional({ description: 'ID dòng BML_STORED_SR_SERVICES (đổi liên kết nếu cần)' })
    @IsOptional()
    @IsUUID()
    storedSrServicesId?: string;

    @ApiPropertyOptional({ description: 'Kết quả PIVKA-II (chuỗi số thập phân từ FE)' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    pivkaIiResult?: string;

    @ApiPropertyOptional({ description: 'Kết quả AFP (chuỗi số thập phân từ FE)' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    afpFullResult?: string;

    @ApiPropertyOptional({ description: 'Kết quả AFP L3 (chuỗi số thập phân từ FE)' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    afpL3?: string;
}

