import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteSampleTypeDto {
    @ApiProperty({ description: 'ID loại mẫu cần xóa', example: 'uuid-string' })
    @IsString()
    @IsNotEmpty()
    id: string;
}
