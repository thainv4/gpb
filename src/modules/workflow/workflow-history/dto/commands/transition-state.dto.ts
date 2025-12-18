import { IsString, IsNotEmpty, IsOptional, IsIn, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransitionStateDto {
    @ApiProperty({ description: 'ID của Service Request', example: 'uuid-sr-001' })
    @IsString()
    @IsNotEmpty({ message: 'Service Request ID là bắt buộc' })
    @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { message: 'Service Request ID phải là UUID hợp lệ' })
    storedServiceReqId: string;

    @ApiPropertyOptional({ description: 'ID của Service cụ thể (NULL = áp dụng cho toàn bộ SR)', example: 'uuid-service-001' })
    @IsOptional()
    @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { message: 'Service ID phải là UUID hợp lệ' })
    storedServiceId?: string;

    @ApiProperty({ description: 'ID của trạng thái đích (trạng thái muốn chuyển đến)', example: 'uuid-state-002' })
    @IsString()
    @IsNotEmpty({ message: 'To State ID là bắt buộc' })
    @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { message: 'To State ID phải là UUID hợp lệ' })
    toStateId: string;

    @ApiProperty({ description: 'Loại action', example: 'COMPLETE', enum: ['COMPLETE', 'SKIP', 'ROLLBACK', 'PAUSE', 'RESUME'] })
    @IsString()
    @IsNotEmpty({ message: 'Action Type là bắt buộc' })
    @IsIn(['COMPLETE', 'SKIP', 'ROLLBACK', 'PAUSE', 'RESUME'], { message: 'Action Type không hợp lệ' })
    actionType: 'COMPLETE' | 'SKIP' | 'ROLLBACK' | 'PAUSE' | 'RESUME';

    @ApiPropertyOptional({ description: 'ID của user đang xử lý (mới)', example: 'uuid-user-002' })
    @IsOptional()
    @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { message: 'Current User ID phải là UUID hợp lệ' })
    currentUserId?: string;

    @ApiPropertyOptional({ description: 'ID của department đang xử lý (mới)', example: 'uuid-dept-002' })
    @IsOptional()
    @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { message: 'Current Department ID phải là UUID hợp lệ' })
    currentDepartmentId?: string;

    @ApiPropertyOptional({ description: 'ID của room đang xử lý (mới)', example: 'uuid-room-002' })
    @IsOptional()
    @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { message: 'Current Room ID phải là UUID hợp lệ' })
    currentRoomId?: string;

    @ApiPropertyOptional({ description: 'Thời gian dự kiến hoàn thành', example: '2025-11-01T10:00:00Z' })
    @IsOptional()
    @IsString()
    estimatedCompletionTime?: string;

    @ApiPropertyOptional({ description: 'Ghi chú', example: 'Hoàn thành bước lấy mẫu, chuyển sang bàn giao' })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({ description: 'Link file đính kèm', example: 'https://example.com/attachment.pdf' })
    @IsOptional()
    @IsString()
    attachmentUrl?: string;
}

