import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDeviceStainingMethodDto {
    @ApiProperty({ description: 'Tên phương pháp nhuộm (thiết bị)', example: 'Hematoxylin and Eosin' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    methodName: string;
}
