import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReceptionCodeDto {
    @ApiProperty({ 
        description: 'Mã tiếp nhận mới',
        example: 'RCP20251229001'
    })
    @IsString()
    @IsNotEmpty({ message: 'Reception code không được để trống' })
    receptionCode: string;
}

