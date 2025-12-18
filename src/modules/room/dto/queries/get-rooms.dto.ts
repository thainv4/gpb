import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsBoolean, IsString, IsUUID, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetRoomsDto {
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
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Lọc theo khoa',
        example: 'dept-001',
    })
    @IsOptional()
    @IsString()
    @IsUUID()
    departmentId?: string;

    @ApiPropertyOptional({
        description: 'Lọc theo nhóm phòng',
        example: 'group-001',
    })
    @IsOptional()
    @IsString()
    @IsUUID()
    roomGroupId?: string;

    @ApiPropertyOptional({
        description: 'Sắp xếp theo trường',
        example: 'sortOrder',
        enum: ['sortOrder', 'roomCode', 'roomName', 'createdAt', 'updatedAt'],
    })
    @IsOptional()
    @IsString()
    sortBy?: string = 'sortOrder';

    @ApiPropertyOptional({
        description: 'Thứ tự sắp xếp',
        example: 'ASC',
        enum: ['ASC', 'DESC'],
    })
    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
