import { IsString, IsNotEmpty, IsOptional, IsUUID, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StartWorkflowDto {
    @ApiProperty({ description: 'ID của Service Request', example: 'uuid-sr-001' })
    @IsString()
    @IsNotEmpty({ message: 'Service Request ID là bắt buộc' })
    @IsUUID(4, { message: 'Service Request ID phải là UUID hợp lệ' })
    storedServiceReqId: string;

    @ApiPropertyOptional({ description: 'ID của Service cụ thể (NULL = áp dụng cho toàn bộ SR)', example: 'uuid-service-001' })
    @IsOptional()
    @IsUUID(4, { message: 'Service ID phải là UUID hợp lệ' })
    storedServiceId?: string;

    @ApiProperty({ description: 'ID của trạng thái bắt đầu (thường là trạng thái đầu tiên)', example: 'uuid-state-001' })
    @IsString()
    @IsNotEmpty({ message: 'State ID là bắt buộc' })
    @IsUUID(4, { message: 'State ID phải là UUID hợp lệ' })
    toStateId: string;

    @ApiPropertyOptional({ description: 'ID của user đang xử lý', example: 'uuid-user-001' })
    @IsOptional()
    @IsUUID(4, { message: 'Current User ID phải là UUID hợp lệ' })
    currentUserId?: string;

    @ApiPropertyOptional({ description: 'ID của department đang xử lý', example: 'uuid-dept-001' })
    @IsOptional()
    @IsUUID(4, { message: 'Current Department ID phải là UUID hợp lệ' })
    currentDepartmentId?: string;

    @ApiPropertyOptional({ description: 'ID của room đang xử lý', example: 'uuid-room-001' })
    @IsOptional()
    @IsUUID(4, { message: 'Current Room ID phải là UUID hợp lệ' })
    currentRoomId?: string;

    @ApiPropertyOptional({ description: 'Thời gian dự kiến hoàn thành', example: '2025-11-01T10:00:00Z' })
    @IsOptional()
    @IsString()
    estimatedCompletionTime?: string;

    @ApiPropertyOptional({ description: 'Ghi chú', example: 'Workflow bắt đầu từ bước lấy mẫu' })
    @IsOptional()
    @IsString()
    notes?: string;
}

