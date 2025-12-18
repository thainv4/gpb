import { IsOptional, IsNumber, Min, Max, IsString, IsIn, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetWorkflowHistoryDto {
    @ApiPropertyOptional({ description: 'ID của Service Request', example: 'uuid-sr-001' })
    @IsOptional()
    @IsUUID(4, { message: 'Service Request ID phải là UUID hợp lệ' })
    storedServiceReqId?: string;

    @ApiPropertyOptional({ description: 'ID của Service cụ thể', example: 'uuid-service-001' })
    @IsOptional()
    @IsUUID(4, { message: 'Service ID phải là UUID hợp lệ' })
    storedServiceId?: string;

    @ApiPropertyOptional({ description: 'Chỉ lấy current state (1) hay tất cả history (0)', example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Is Current phải là số' })
    @IsIn([0, 1], { message: 'Is Current phải là 0 hoặc 1' })
    isCurrent?: number;

    @ApiPropertyOptional({ description: 'Lọc theo action type', example: 'COMPLETE', enum: ['START', 'COMPLETE', 'SKIP', 'ROLLBACK', 'PAUSE', 'RESUME'] })
    @IsOptional()
    @IsString()
    @IsIn(['START', 'COMPLETE', 'SKIP', 'ROLLBACK', 'PAUSE', 'RESUME'], { message: 'Action Type không hợp lệ' })
    actionType?: string;

    @ApiPropertyOptional({ description: 'Lọc theo user', example: 'uuid-user-001' })
    @IsOptional()
    @IsUUID(4, { message: 'User ID phải là UUID hợp lệ' })
    actionUserId?: string;

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

    @ApiPropertyOptional({ description: 'Sắp xếp theo', example: 'DESC', enum: ['ASC', 'DESC'] })
    @IsOptional()
    @IsString()
    @IsIn(['ASC', 'DESC'], { message: 'Order phải là ASC hoặc DESC' })
    order?: 'ASC' | 'DESC' = 'DESC';

    @ApiPropertyOptional({ description: 'Sắp xếp theo field', example: 'actionTimestamp', enum: ['actionTimestamp', 'createdAt'] })
    @IsOptional()
    @IsString()
    @IsIn(['actionTimestamp', 'createdAt'], { message: 'Order by không hợp lệ' })
    orderBy?: 'actionTimestamp' | 'createdAt' = 'actionTimestamp';
}

