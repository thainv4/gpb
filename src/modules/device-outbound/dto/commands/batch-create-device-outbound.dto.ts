import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    ArrayMinSize,
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsString,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DeviceOutboundBatchItemDto {
    @ApiProperty({ description: 'Số block (số nguyên)', example: 2 })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    blockNumber: number;

    @ApiProperty({ description: 'Số slide (số nguyên)', example: 3 })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    slideNumber: number;

    @ApiProperty({ description: 'Phương pháp (vd: HE, PAS, CL)', example: 'HE' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    method: string;
}

/**
 * DTO tạo nhiều bản ghi Device Outbound trong một lần gọi.
 * Block_ID và Slide_ID được tính tự động từ receptionCode, blockNumber, slideNumber.
 */
export class BatchCreateDeviceOutboundDto {
    @ApiProperty({ description: 'Mã tiếp nhận mẫu', example: 'S2601.0312' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    receptionCode: string;

    @ApiProperty({ description: 'Mã dịch vụ áp dụng cho tất cả dòng', example: 'BM125' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    serviceCode: string;

    @ApiProperty({
        description: 'Danh sách dòng Device Outbound',
        type: [DeviceOutboundBatchItemDto],
    })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => DeviceOutboundBatchItemDto)
    items: DeviceOutboundBatchItemDto[];
}

