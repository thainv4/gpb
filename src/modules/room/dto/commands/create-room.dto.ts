import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsUUID, Length, Min, Max } from 'class-validator';

export class CreateRoomDto {
    @ApiProperty({
        description: 'Mã phòng (duy nhất)',
        example: 'P001',
        maxLength: 20,
    })
    @IsString()
    @IsNotEmpty()
    @Length(1, 20)
    roomCode: string;

    @ApiProperty({
        description: 'Tên phòng',
        example: 'Phòng 101',
        maxLength: 100,
    })
    @IsString()
    @IsNotEmpty()
    @Length(1, 100)
    roomName: string;

    @ApiPropertyOptional({
        description: 'Địa chỉ phòng',
        example: 'Tầng 1, Khu A',
        maxLength: 200,
    })
    @IsString()
    @IsOptional()
    @Length(1, 200)
    roomAddress?: string;

    @ApiProperty({
        description: 'ID khoa',
        example: 'dept-001',
    })
    @IsString()
    @IsNotEmpty()
    departmentId: string;

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
        default: true,
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
