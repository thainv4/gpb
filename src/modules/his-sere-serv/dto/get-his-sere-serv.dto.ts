import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GetHisSereServDto {
    @ApiProperty({ description: 'Mã yêu cầu dịch vụ', example: '000063851158', required: true })
    @IsString()
    @IsNotEmpty()
    tdlServiceReqCode: string;

    @ApiProperty({ description: 'Mã dịch vụ', example: 'BM00233', required: true })
    @IsString()
    @IsNotEmpty()
    tdlServiceCode: string;
}
