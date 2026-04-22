import { IsOptional, IsNumber, Min, Max, IsString, IsIn, Matches, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Query báo cáo xuất Excel — giống by-room-and-state nhưng luôn lọc/sort theo actionTimestamp (không có timeType).
 */
export class GetWorkflowHistoryReportExportDto {
    @ApiPropertyOptional({
        description: 'ID của phòng (để trống để lấy tất cả phòng được phân quyền)',
        example: 'b7ad73ac-2f7a-42c0-bd15-be55887aea49',
    })
    @IsOptional()
    @Matches(/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?$/i, {
        message: 'Room ID phải là UUID hợp lệ hoặc để trống',
    })
    roomId?: string;

    @ApiPropertyOptional({
        description: 'ID của workflow state (để trống hoặc chuỗi rỗng để lấy tất cả)',
        example: 'state-uuid-001',
    })
    @IsOptional()
    @Matches(/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?$/i, {
        message: 'State ID phải là UUID hợp lệ hoặc chuỗi rỗng',
    })
    stateId?: string;

    @ApiPropertyOptional({
        description: 'Mã tìm kiếm - HIS Service Request Code, Reception Code hoặc PATIENT_CODE',
    })
    @IsOptional()
    @IsString()
    code?: string;

    @ApiPropertyOptional({ description: 'Flag của stored service request' })
    @IsOptional()
    @IsString()
    flag?: string;

    @ApiPropertyOptional({ description: 'Tên bệnh nhân (partial match)' })
    @IsOptional()
    @IsString()
    patientName?: string;

    @ApiPropertyOptional({
        description: 'Loại room field để filter',
        enum: ['actionRoomId', 'currentRoomId', 'transitionedByRoomId'],
        default: 'currentRoomId',
    })
    @IsOptional()
    @IsString()
    @IsIn(['actionRoomId', 'currentRoomId', 'transitionedByRoomId'], {
        message: 'Room type phải là một trong: actionRoomId, currentRoomId, transitionedByRoomId',
    })
    roomType?: 'actionRoomId' | 'currentRoomId' | 'transitionedByRoomId' = 'currentRoomId';

    @ApiPropertyOptional({
        description: 'Loại state field để filter',
        enum: ['toStateId', 'fromStateId'],
        default: 'toStateId',
    })
    @IsOptional()
    @IsString()
    @IsIn(['toStateId', 'fromStateId'], {
        message: 'State type phải là toStateId hoặc fromStateId',
    })
    stateType?: 'toStateId' | 'fromStateId' = 'toStateId';

    @ApiPropertyOptional({ description: 'Chỉ lấy current state (1) hay tất cả history (0)', example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Is Current phải là số' })
    @IsIn([0, 1], { message: 'Is Current phải là 0 hoặc 1' })
    isCurrent?: number;

    @ApiPropertyOptional({ description: 'Từ ngày (ISO string)', example: '2025-11-01T00:00:00.000Z' })
    @IsOptional()
    @IsDateString({}, { message: 'From date phải là định dạng ISO date hợp lệ' })
    fromDate?: string;

    @ApiPropertyOptional({ description: 'Đến ngày (ISO string)', example: '2025-11-30T23:59:59.999Z' })
    @IsOptional()
    @IsDateString({}, { message: 'To date phải là định dạng ISO date hợp lệ' })
    toDate?: string;

    @ApiPropertyOptional({
        description: 'Giới hạn an toàn số dòng tối đa được xuất (mặc định 200.000)',
        example: 200000,
        default: 200000,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'maxRows phải là số' })
    @Min(1, { message: 'maxRows phải lớn hơn 0' })
    @Max(1_000_000, { message: 'maxRows không được quá 1.000.000' })
    maxRows?: number = 200000;

    @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
    @IsOptional()
    @IsString()
    @IsIn(['ASC', 'DESC'], { message: 'Order phải là ASC hoặc DESC' })
    order?: 'ASC' | 'DESC' = 'DESC';

    @ApiPropertyOptional({
        enum: ['actionTimestamp', 'createdAt', 'startedAt'],
        default: 'actionTimestamp',
    })
    @IsOptional()
    @IsString()
    @IsIn(['actionTimestamp', 'createdAt', 'startedAt'], {
        message: 'Order by không hợp lệ',
    })
    orderBy?: 'actionTimestamp' | 'createdAt' | 'startedAt' = 'actionTimestamp';
}
