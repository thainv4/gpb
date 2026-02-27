import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetResultConcludeByReceptionCodeDto {
    @ApiProperty({
        description: 'Mã tiếp nhận (reception code)',
        example: 'BLOOD.20241024.0001',
    })
    @IsNotEmpty({ message: 'receptionCode không được để trống' })
    @IsString()
    receptionCode: string;
}
