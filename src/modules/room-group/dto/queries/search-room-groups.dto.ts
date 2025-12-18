import { PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GetRoomGroupsDto, RoomGroupSortBy, RoomGroupSortOrder } from './get-room-groups.dto';
import { Type } from 'class-transformer';

export class SearchRoomGroupsDto extends PartialType(GetRoomGroupsDto) {
    @ApiProperty({
        description: 'Từ khóa tìm kiếm (mã, tên nhóm phòng)',
        example: 'vip',
        required: false,
    })
    @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi' })
    @IsNotEmpty({ message: 'Từ khóa tìm kiếm không được để trống' })
    @Length(1, 100, { message: 'Từ khóa tìm kiếm phải từ 1 đến 100 ký tự' })
    keyword: string;

    @ApiProperty({
        description: 'Lọc theo trạng thái hoạt động',
        example: true,
        required: false,
    })
    @IsBoolean({ message: 'Trạng thái hoạt động phải là boolean' })
    @IsOptional()
    @Type(() => Boolean)
    isActive?: boolean;
}
