import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPatientsDto {
    @ApiPropertyOptional({ description: 'Số lượng bản ghi trên mỗi trang', example: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Số lượng bản ghi bỏ qua', example: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    offset?: number = 0;

    @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm theo tên, mã, CMND hoặc SĐT', example: 'Nguyễn Văn A' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'ID tỉnh để lọc', example: 'uuid-province-id' })
    @IsOptional()
    @IsString()
    provinceId?: string;

    @ApiPropertyOptional({ description: 'ID phường/xã để lọc', example: 'uuid-ward-id' })
    @IsOptional()
    @IsString()
    wardId?: string;

    @ApiPropertyOptional({ description: 'ID giới tính để lọc', example: 'uuid-gender-id' })
    @IsOptional()
    @IsString()
    genderId?: string;

    @ApiPropertyOptional({ description: 'Trường để sắp xếp', example: 'createdAt', enum: ['patientCode', 'patientName', 'dateOfBirth', 'createdAt'] })
    @IsOptional()
    @IsString()
    @IsIn(['patientCode', 'patientName', 'dateOfBirth', 'createdAt'])
    sortBy?: string = 'createdAt';

    @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', example: 'DESC', enum: ['ASC', 'DESC'] })
    @IsOptional()
    @IsString()
    @IsIn(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
