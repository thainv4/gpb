import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTestingMethodGenDto {
    @ApiProperty({ description: 'Tên phương pháp xét nghiệm', example: 'Venipuncture', maxLength: 50 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    methodName: string;
}
