import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class SearchServicesDto extends PaginationDto {
    @ApiProperty({
        description: 'Từ khóa tìm kiếm',
        example: 'xét nghiệm máu'
    })
    @IsString()
    search: string;

    @ApiPropertyOptional({
        description: 'ID nhóm dịch vụ để lọc',
        example: 'group-uuid-here'
    })
    @IsUUID(4, { message: 'ID nhóm dịch vụ phải là UUID hợp lệ' })
    @IsOptional()
    serviceGroupId?: string;

    @ApiPropertyOptional({
        description: 'Chỉ tìm trong dịch vụ gốc (không có cha)',
        example: true
    })
    @IsOptional()
    rootOnly?: boolean;
}
