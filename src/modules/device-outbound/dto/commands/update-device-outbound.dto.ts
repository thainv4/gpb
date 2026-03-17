import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Cập nhật bản ghi Device Outbound (partial).
 * Nếu cung cấp receptionCode/blockNumber/slideNumber thì Block_ID và Slide_id sẽ được tính lại.
 */
export class UpdateDeviceOutboundDto {
    @ApiPropertyOptional({ description: 'Mã tiếp nhận mẫu', example: 'S2601.0312' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    receptionCode?: string;

    @ApiPropertyOptional({ description: 'Mã dịch vụ', example: 'BM125' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    serviceCode?: string;

    @ApiPropertyOptional({ description: 'Số block (số nguyên)', example: 2 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    blockNumber?: number;

    @ApiPropertyOptional({ description: 'Số slide (số nguyên)', example: 3 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    slideNumber?: number;

    @ApiPropertyOptional({ description: 'Phương pháp (vd: HE)', example: 'HE' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    method?: string;
}
