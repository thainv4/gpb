import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserRoomDto {
    @ApiPropertyOptional({
        description: 'Trạng thái hoạt động của phân quyền phòng',
        example: true
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
