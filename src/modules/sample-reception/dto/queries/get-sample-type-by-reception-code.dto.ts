import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class GetSampleTypeByReceptionCodeDto {
    @ApiProperty({ 
        description: 'Mã tiếp nhận (Reception Code)', 
        example: 'BLOOD.20241024.0001' 
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(100)
    receptionCode: string;
}
