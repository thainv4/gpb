import { IsOptional, IsString, IsNumber, Min, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum RoomGroupSortBy {
    ROOM_GROUP_CODE = 'roomGroupCode',
    ROOM_GROUP_NAME = 'roomGroupName',
    SORT_ORDER = 'sortOrder',
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
}

export enum RoomGroupSortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class GetRoomGroupsDto {
    @ApiProperty({
        description: 'Số lượng bản ghi trên mỗi trang',
        example: 10,
        required: false,
        minimum: 1,
    })
    @IsNumber({}, { message: 'Giới hạn phải là số' })
    @Min(1, { message: 'Giới hạn phải lớn hơn hoặc bằng 1' })
    @IsOptional()
    @Type(() => Number)
    limit?: number = 10;

    @ApiProperty({
        description: 'Số lượng bản ghi bỏ qua (offset)',
        example: 0,
        required: false,
        minimum: 0,
    })
    @IsNumber({}, { message: 'Offset phải là số' })
    @Min(0, { message: 'Offset phải lớn hơn hoặc bằng 0' })
    @IsOptional()
    @Type(() => Number)
    offset?: number = 0;

    @ApiProperty({
        description: 'Từ khóa tìm kiếm (mã, tên nhóm phòng)',
        example: 'vip',
        required: false,
    })
    @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi' })
    @IsOptional()
    search?: string;

    @ApiProperty({
        description: 'Lọc theo trạng thái hoạt động',
        example: true,
        required: false,
    })
    @IsBoolean({ message: 'Trạng thái hoạt động phải là boolean' })
    @IsOptional()
    @Type(() => Boolean)
    isActive?: boolean;

    @ApiProperty({
        description: 'Sắp xếp theo trường',
        enum: RoomGroupSortBy,
        example: RoomGroupSortBy.SORT_ORDER,
        required: false,
    })
    @IsEnum(RoomGroupSortBy, { message: 'Trường sắp xếp không hợp lệ' })
    @IsOptional()
    sortBy?: RoomGroupSortBy = RoomGroupSortBy.SORT_ORDER;

    @ApiProperty({
        description: 'Thứ tự sắp xếp',
        enum: RoomGroupSortOrder,
        example: RoomGroupSortOrder.ASC,
        required: false,
    })
    @IsEnum(RoomGroupSortOrder, { message: 'Thứ tự sắp xếp không hợp lệ' })
    @IsOptional()
    sortOrder?: RoomGroupSortOrder = RoomGroupSortOrder.ASC;
}

export interface GetRoomGroupsResult {
    roomGroups: any[];
    total: number;
    limit: number;
    offset: number;
}
