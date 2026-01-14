import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateStainingMethodDto {
    @ApiProperty({ description: 'Tên phương pháp nhuộm', example: 'Hematoxylin and Eosin' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    methodName: string;
}
