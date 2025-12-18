import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteServiceGroupDto {
    @ApiProperty({ description: 'ID của nhóm dịch vụ cần xóa' })
    @IsString()
    @IsNotEmpty()
    id: string;
}
