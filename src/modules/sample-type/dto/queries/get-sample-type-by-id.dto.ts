import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetSampleTypeByIdDto {
    @ApiProperty({ description: 'ID loại mẫu', example: 'uuid-string' })
    @IsString()
    @IsNotEmpty()
    id: string;
}
