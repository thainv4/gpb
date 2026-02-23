import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetStoredSignedDocumentsDto {
    @ApiPropertyOptional({ description: 'Số lượng bản ghi', example: 10, minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Vị trí bắt đầu', example: 0, minimum: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    offset?: number = 0;

    @ApiPropertyOptional({ description: 'Tìm kiếm theo hisServiceReqCode hoặc storedServiceReqId', example: '000055537395' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Lọc theo documentId', example: 12345 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    documentId?: number;
}
