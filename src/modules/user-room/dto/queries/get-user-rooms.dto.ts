import { IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class GetUserRoomsDto extends PaginationDto {
    @ApiPropertyOptional({
        description: 'ID của user cần lấy danh sách phòng',
        example: 'user-uuid-here'
    })
    @IsUUID(4)
    @IsOptional()
    userId?: string;

    @ApiPropertyOptional({
        description: 'Lọc theo trạng thái hoạt động',
        example: true
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
