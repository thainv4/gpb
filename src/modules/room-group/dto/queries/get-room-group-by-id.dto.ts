import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetRoomGroupByIdDto {
    @ApiProperty({
        description: 'ID của nhóm phòng',
        example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    })
    @IsString({ message: 'ID phải là chuỗi' })
    @IsNotEmpty({ message: 'ID không được để trống' })
    id: string;

    @ApiProperty({
        description: 'Bao gồm cả các bản ghi đã xóa mềm',
        example: false,
        required: false,
    })
    @IsBoolean({ message: 'includeDeleted phải là boolean' })
    @IsOptional()
    @Type(() => Boolean)
    includeDeleted?: boolean;
}
