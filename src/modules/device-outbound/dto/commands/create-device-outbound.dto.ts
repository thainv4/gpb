import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Đầu vào tạo bản ghi Device Outbound.
 * Block_ID và Slide_id được tính tự động: Block_ID = receptionCode + 'A' + blockNumber, Slide_id = receptionCode + 'A' + blockNumber + '.' + slideNumber.
 */
export class CreateDeviceOutboundDto {
    @ApiProperty({ description: 'Mã tiếp nhận mẫu', example: 'S2601.0312' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    receptionCode: string;

    @ApiProperty({ description: 'Mã dịch vụ', example: 'BM125' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    serviceCode: string;

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

    @ApiProperty({ description: 'Phương pháp (vd: HE)', example: 'HE' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    method: string;
}
