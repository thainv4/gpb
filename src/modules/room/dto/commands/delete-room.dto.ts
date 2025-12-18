import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteRoomDto {
    @ApiProperty({
        description: 'ID phòng cần xóa',
        example: 'room-001',
    })
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    id: string;
}
