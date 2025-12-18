import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoomsDto {
    @ApiProperty({
        description: 'Danh sách ID phòng cần gán cho user',
        example: ['room-001', 'room-002', 'room-003'],
        type: [String]
    })
    @IsArray()
    @ArrayMinSize(1, { message: 'Danh sách phòng không được rỗng' })
    @IsUUID(4, { each: true, message: 'Mỗi ID phòng phải là UUID hợp lệ' })
    roomIds: string[];
}
