import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class DeletePatientDto {
    @ApiProperty({ description: 'ID của bệnh nhân cần xóa', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
    @IsString()
    @IsNotEmpty()
    id: string;
}
