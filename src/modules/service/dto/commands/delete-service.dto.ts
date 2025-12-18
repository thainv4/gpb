import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class DeleteServiceDto {
    @ApiPropertyOptional({
        description: 'Lý do xóa dịch vụ',
        example: 'Dịch vụ không còn được sử dụng'
    })
    @IsString()
    @IsOptional()
    reason?: string;
}
