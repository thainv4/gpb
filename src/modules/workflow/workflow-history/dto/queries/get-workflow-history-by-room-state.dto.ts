import { IsNotEmpty, IsOptional, IsNumber, Min, Max, IsString, IsIn, Matches, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetWorkflowHistoryByRoomStateDto {
    @ApiPropertyOptional({ 
        description: 'ID của phòng (để trống để lấy tất cả phòng)', 
        example: 'b7ad73ac-2f7a-42c0-bd15-be55887aea49' 
    })
    @IsOptional()
    @Matches(/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?$/i, { 
        message: 'Room ID phải là UUID hợp lệ hoặc để trống' 
    })
    roomId?: string;

    @ApiPropertyOptional({ 
        description: 'ID của workflow state (để trống hoặc chuỗi rỗng để lấy tất cả)', 
        example: 'state-uuid-001' 
    })
    @IsOptional()
    @Matches(/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?$/i, { 
        message: 'State ID phải là UUID hợp lệ hoặc chuỗi rỗng' 
    })
    stateId?: string;

    @ApiPropertyOptional({ 
        description: 'Mã tìm kiếm - có thể là HIS Service Request Code hoặc Reception Code (để trống để lấy tất cả)', 
        example: 'SR2024120001 hoặc BLOOD.20241024.0001'
    })
    @IsOptional()
    @IsString()
    code?: string;

    @ApiPropertyOptional({ 
        description: 'Flag của stored service request (để trống để lấy tất cả, có thể null để lấy các request không có flag)', 
        example: 'URGENT'
    })
    @IsOptional()
    @IsString()
    flag?: string;

    @ApiPropertyOptional({ 
        description: 'Tên bệnh nhân (tìm kiếm theo PATIENT_NAME, partial match, để trống để lấy tất cả)', 
        example: 'Nguyễn Văn A'
    })
    @IsOptional()
    @IsString()
    patientName?: string;

    @ApiPropertyOptional({ 
        description: 'Loại room field để filter (actionRoomId, currentRoomId, transitionedByRoomId)', 
        enum: ['actionRoomId', 'currentRoomId', 'transitionedByRoomId'],
        default: 'currentRoomId'
    })
    @IsOptional()
    @IsString()
    @IsIn(['actionRoomId', 'currentRoomId', 'transitionedByRoomId'], { 
        message: 'Room type phải là một trong: actionRoomId, currentRoomId, transitionedByRoomId' 
    })
    roomType?: 'actionRoomId' | 'currentRoomId' | 'transitionedByRoomId' = 'currentRoomId';

    @ApiPropertyOptional({ 
        description: 'Loại state field để filter (toStateId, fromStateId)', 
        enum: ['toStateId', 'fromStateId'],
        default: 'toStateId'
    })
    @IsOptional()
    @IsString()
    @IsIn(['toStateId', 'fromStateId'], { 
        message: 'State type phải là toStateId hoặc fromStateId' 
    })
    stateType?: 'toStateId' | 'fromStateId' = 'toStateId';

    @ApiPropertyOptional({ 
        description: 'Chỉ lấy current state (1) hay tất cả history (0)', 
        example: 1 
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Is Current phải là số' })
    @IsIn([0, 1], { message: 'Is Current phải là 0 hoặc 1' })
    isCurrent?: number;

    // ========== TIME FILTERS ==========
    
    @ApiPropertyOptional({ 
        description: 'Loại thời gian để filter', 
        enum: ['actionTimestamp', 'startedAt', 'completedAt', 'currentStateStartedAt'],
        default: 'actionTimestamp'
    })
    @IsOptional()
    @IsString()
    @IsIn(['actionTimestamp', 'startedAt', 'completedAt', 'currentStateStartedAt'], { 
        message: 'Time type phải là một trong: actionTimestamp, startedAt, completedAt, currentStateStartedAt' 
    })
    timeType?: 'actionTimestamp' | 'startedAt' | 'completedAt' | 'currentStateStartedAt' = 'actionTimestamp';

    @ApiPropertyOptional({ 
        description: 'Từ ngày (ISO string)', 
        example: '2025-11-01T00:00:00Z' 
    })
    @IsOptional()
    @IsDateString({}, { message: 'From date phải là định dạng ISO date hợp lệ' })
    fromDate?: string;

    @ApiPropertyOptional({ 
        description: 'Đến ngày (ISO string)', 
        example: '2025-11-30T23:59:59Z' 
    })
    @IsOptional()
    @IsDateString({}, { message: 'To date phải là định dạng ISO date hợp lệ' })
    toDate?: string;

    // ========== PAGINATION ==========

    @ApiPropertyOptional({ 
        description: 'Số lượng records trả về', 
        example: 10, 
        default: 10 
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Limit phải là số' })
    @Min(1, { message: 'Limit phải lớn hơn 0' })
    @Max(10000, { message: 'Limit không được quá 10000' })
    limit?: number = 10;

    @ApiPropertyOptional({ 
        description: 'Vị trí bắt đầu (offset)', 
        example: 0, 
        default: 0 
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Offset phải là số' })
    @Min(0, { message: 'Offset phải lớn hơn hoặc bằng 0' })
    offset?: number = 0;

    @ApiPropertyOptional({ 
        description: 'Sắp xếp theo', 
        example: 'DESC', 
        enum: ['ASC', 'DESC'] 
    })
    @IsOptional()
    @IsString()
    @IsIn(['ASC', 'DESC'], { message: 'Order phải là ASC hoặc DESC' })
    order?: 'ASC' | 'DESC' = 'DESC';

    @ApiPropertyOptional({ 
        description: 'Sắp xếp theo field', 
        example: 'actionTimestamp', 
        enum: ['actionTimestamp', 'createdAt', 'startedAt'] 
    })
    @IsOptional()
    @IsString()
    @IsIn(['actionTimestamp', 'createdAt', 'startedAt'], { 
        message: 'Order by không hợp lệ' 
    })
    orderBy?: 'actionTimestamp' | 'createdAt' | 'startedAt' = 'actionTimestamp';
}
