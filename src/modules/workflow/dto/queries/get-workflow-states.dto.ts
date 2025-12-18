import { IsOptional, IsNumber, Min, Max, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetWorkflowStatesDto {
    @ApiPropertyOptional({ description: 'Số lượng records trả về', example: 10, default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Limit phải là số' })
    @Min(1, { message: 'Limit phải lớn hơn 0' })
    @Max(100, { message: 'Limit không được quá 100' })
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Vị trí bắt đầu (offset)', example: 0, default: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Offset phải là số' })
    @Min(0, { message: 'Offset phải lớn hơn hoặc bằng 0' })
    offset?: number = 0;

    @ApiPropertyOptional({ description: 'Tìm kiếm theo tên/mã trạng thái', example: 'Lấy mẫu' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Lọc theo trạng thái active (0/1)', example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Is active phải là số' })
    @IsIn([0, 1], { message: 'Is active phải là 0 hoặc 1' })
    isActive?: number;

    @ApiPropertyOptional({ description: 'Sắp xếp theo thứ tự (ASC/DESC)', example: 'ASC', enum: ['ASC', 'DESC'] })
    @IsOptional()
    @IsString()
    @IsIn(['ASC', 'DESC'], { message: 'Order phải là ASC hoặc DESC' })
    order?: 'ASC' | 'DESC' = 'ASC';

    @ApiPropertyOptional({ description: 'Sắp xếp theo field', example: 'stateOrder', enum: ['stateOrder', 'stateName', 'createdAt'] })
    @IsOptional()
    @IsString()
    @IsIn(['stateOrder', 'stateName', 'createdAt'], { message: 'Order by không hợp lệ' })
    orderBy?: 'stateOrder' | 'stateName' | 'createdAt' = 'stateOrder';
}

