import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchRoomsDto {
    @ApiProperty({
        description: 'Từ khóa tìm kiếm',
        example: 'phòng 101',
    })
    @IsString()
    @IsNotEmpty()
    searchTerm: string;

    @ApiPropertyOptional({
        description: 'Số lượng bản ghi trả về',
        example: 10,
        minimum: 1,
        maximum: 100,
        default: 10,
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({
        description: 'Vị trí bắt đầu',
        example: 0,
        minimum: 0,
        default: 0,
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(0)
    offset?: number = 0;

    @ApiPropertyOptional({
        description: 'Lọc theo trạng thái hoạt động',
        example: true,
    })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Lọc theo khoa',
        example: 'dept-001',
    })
    @IsOptional()
    @IsString()
    departmentId?: string;

    @ApiPropertyOptional({
        description: 'Lọc theo nhóm phòng',
        example: 'group-001',
    })
    @IsOptional()
    @IsString()
    roomGroupId?: string;
}
