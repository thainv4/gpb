import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class GetRoomByIdDto {
    @ApiProperty({
        description: 'ID phòng',
        example: 'room-001',
    })
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    id: string;
}
