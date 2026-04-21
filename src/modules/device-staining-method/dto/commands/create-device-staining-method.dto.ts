import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDeviceStainingMethodDto {
    @ApiProperty({ description: 'Tên phương pháp nhuộm (thiết bị)', example: 'Hematoxylin and Eosin' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    methodName: string;

    @ApiProperty({ description: 'Số/ký hiệu protocol trên thiết bị (bắt buộc)', example: 'P-HE-01' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    protocolNo: string;
}
