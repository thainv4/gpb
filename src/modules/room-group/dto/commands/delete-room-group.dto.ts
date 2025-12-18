import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteRoomGroupDto {
    @ApiProperty({
        description: 'ID của nhóm phòng cần xóa',
        example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    })
    @IsString({ message: 'ID phải là chuỗi' })
    @IsNotEmpty({ message: 'ID không được để trống' })
    id: string;

    @ApiProperty({
        description: 'Xóa cứng khỏi cơ sở dữ liệu (mặc định là xóa mềm)',
        example: false,
        required: false,
    })
    @IsBoolean({ message: 'hardDelete phải là boolean' })
    @IsOptional()
    hardDelete?: boolean;
}
