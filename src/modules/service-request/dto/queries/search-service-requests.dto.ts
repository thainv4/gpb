import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchServiceRequestsDto {
    @ApiPropertyOptional({ description: 'Số lượng bản ghi', example: 10, minimum: 1, maximum: 100 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Vị trí bắt đầu', example: 0, minimum: 0 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    offset?: number = 0;

    @ApiProperty({ description: 'Từ khóa tìm kiếm', example: 'SR2024001' })
    @IsString()
    search: string;

    @ApiPropertyOptional({ description: 'ID trạng thái yêu cầu', example: 3 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    serviceReqSttId?: number;

    @ApiPropertyOptional({ description: 'ID loại yêu cầu', example: 2 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    serviceReqTypeId?: number;

    @ApiPropertyOptional({ description: 'ID bệnh nhân', example: 3151131 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    patientId?: number;

    @ApiPropertyOptional({ description: 'Mã bệnh nhân', example: '0003151004' })
    @IsOptional()
    @IsString()
    patientCode?: string;

    @ApiPropertyOptional({ description: 'Từ ngày (YYYYMMDD)', example: 20240101 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    fromDate?: number;

    @ApiPropertyOptional({ description: 'Đến ngày (YYYYMMDD)', example: 20241231 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    toDate?: number;

    @ApiPropertyOptional({ description: 'ID khoa yêu cầu', example: 104 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    requestDepartmentId?: number;

    @ApiPropertyOptional({ description: 'ID khoa thực hiện', example: 58 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    executeDepartmentId?: number;
}
