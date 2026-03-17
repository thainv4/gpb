import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class GetServicesByReceptionDto {
    @ApiProperty({ description: 'Mã tiếp nhận mẫu', example: 'S2601.0312' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    receptionCode: string;
}
