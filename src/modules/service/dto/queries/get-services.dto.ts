import { IsOptional, IsUUID, IsBooleanString, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class GetServicesDto extends PaginationDto {
    @ApiPropertyOptional({
        description: 'ID nhóm dịch vụ để lọc',
        example: 'group-uuid-here'
    })
    @IsUUID(4, { message: 'ID nhóm dịch vụ phải là UUID hợp lệ' })
    @IsOptional()
    serviceGroupId?: string;

    @ApiPropertyOptional({
        description: 'ID dịch vụ cha để lọc (null = chỉ lấy dịch vụ gốc)',
        example: 'parent-service-uuid-here'
    })
    @IsUUID(4, { message: 'ID dịch vụ cha phải là UUID hợp lệ' })
    @IsOptional()
    parentServiceId?: string;

    @ApiPropertyOptional({
        description: 'Lọc theo trạng thái hoạt động (true/false)',
        example: 'true'
    })
    @IsBooleanString({ message: 'isActive phải là giá trị boolean (true/false)' })
    @IsOptional()
    isActive?: string;

    @ApiPropertyOptional({
        description: 'Tìm kiếm theo mã, tên hoặc tên viết tắt',
        example: 'xét nghiệm'
    })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiPropertyOptional({
        description: 'Giá tối thiểu',
        example: '100000'
    })
    @IsString()
    @IsOptional()
    minPrice?: string;

    @ApiPropertyOptional({
        description: 'Giá tối đa',
        example: '500000'
    })
    @IsString()
    @IsOptional()
    maxPrice?: string;
}
