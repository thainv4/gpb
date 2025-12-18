import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, IsString, IsIn, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class GetProfilesDto {
    @ApiPropertyOptional({ description: 'Số lượng bản ghi mỗi trang', example: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number;

    @ApiPropertyOptional({ description: 'Số lượng bản ghi bỏ qua', example: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    offset?: number;

    @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm (chức vụ, mã NV, SĐT)', example: 'Bác sĩ' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'ID tỉnh/thành phố' })
    @IsOptional()
    @IsUUID()
    provinceId?: string;

    @ApiPropertyOptional({ description: 'ID xã/phường' })
    @IsOptional()
    @IsUUID()
    wardId?: string;

    @ApiPropertyOptional({ description: 'ID khoa/phòng ban' })
    @IsOptional()
    @IsUUID()
    departmentId?: string;

    @ApiPropertyOptional({ description: 'Sắp xếp theo trường', example: 'createdAt' })
    @IsOptional()
    @IsString()
    sortBy?: string;

    @ApiPropertyOptional({ description: 'Thứ tự sắp xếp (ASC/DESC)', example: 'DESC' })
    @IsOptional()
    @IsString()
    @IsIn(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC';
}
