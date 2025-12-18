import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, IsUUID, Length, Min, Max } from 'class-validator';

export class UpdateRoomDto {
    @ApiPropertyOptional({
        description: 'Tên phòng',
        example: 'Phòng 101',
        maxLength: 100,
    })
    @IsString()
    @IsOptional()
    @Length(1, 100)
    roomName?: string;

    @ApiPropertyOptional({
        description: 'Địa chỉ phòng',
        example: 'Tầng 1, Khu A',
        maxLength: 200,
    })
    @IsString()
    @IsOptional()
    @Length(1, 200)
    roomAddress?: string;

    @ApiPropertyOptional({
        description: 'ID khoa',
        example: 'dept-001',
    })
    @IsString()
    @IsOptional()
    @IsUUID()
    departmentId?: string;

    @ApiPropertyOptional({
        description: 'ID nhóm phòng',
        example: 'group-001',
    })
    @IsString()
    @IsOptional()
    @IsUUID()
    roomGroupId?: string;

    @ApiPropertyOptional({
        description: 'Mô tả phòng',
        example: 'Phòng khám nội tổng hợp',
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        description: 'Trạng thái hoạt động',
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Thứ tự sắp xếp',
        example: 1,
        minimum: 0,
        maximum: 9999,
    })
    @IsNumber()
    @IsOptional()
    @Min(0)
    @Max(9999)
    sortOrder?: number;
}
