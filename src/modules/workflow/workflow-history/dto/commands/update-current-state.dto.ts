import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCurrentStateDto {
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

    @ApiPropertyOptional({ description: 'Ghi chú', example: 'Đang chờ kết quả từ máy xét nghiệm' })
    @IsOptional()
    @IsString()
    notes?: string;
}

