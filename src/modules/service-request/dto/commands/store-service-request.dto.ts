import { IsNotEmpty, IsString, IsOptional, IsUUID, IsBoolean, IsDateString, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StoreServiceRequestDto {
    @ApiProperty({
        description: 'Mã yêu cầu dịch vụ từ HIS',
        example: '000055537395'
    })
    @IsNotEmpty({ message: 'Mã yêu cầu dịch vụ là bắt buộc' })
    @IsString()
    serviceReqCode: string;

    @ApiProperty({
        description: 'ID phòng user đang làm việc',
        example: 'uuid-room-001'
    })
    @IsNotEmpty({ message: 'ID phòng là bắt buộc' })
    @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { message: 'ID phòng phải là UUID hợp lệ' })
    currentRoomId: string;

    @ApiProperty({
        description: 'ID khoa user đang làm việc',
        example: 'uuid-dept-001'
    })
    @IsNotEmpty({ message: 'ID khoa là bắt buộc' })
    @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { message: 'ID khoa phải là UUID hợp lệ' })
    currentDepartmentId: string;

    @ApiProperty({
        description: 'Mã tiếp nhận mẫu (unique)',
        example: 'REC-20251101-001'
    })
    @IsNotEmpty({ message: 'Mã tiếp nhận mẫu là bắt buộc' })
    @IsString()
    @MaxLength(50, { message: 'Mã tiếp nhận mẫu không được quá 50 ký tự' })
    receptionCode: string;

    @ApiProperty({
        description: 'Thời gian lấy mẫu (ISO string)',
        example: '2025-11-01T10:30:00Z'
    })
    @IsNotEmpty({ message: 'Thời gian lấy mẫu là bắt buộc' })
    @IsDateString({}, { message: 'Thời gian lấy mẫu phải là định dạng ISO date hợp lệ' })
    sampleCollectionTime: string;

    @ApiPropertyOptional({
        description: 'ID user thực hiện lấy mẫu (nếu khác currentUser)',
        example: 'uuid-user-001'
    })
    @IsOptional()
    @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { message: 'ID user lấy mẫu phải là UUID hợp lệ' })
    collectedByUserId?: string;

    @ApiPropertyOptional({
        description: 'Có lưu toàn bộ JSON response không',
        default: false
    })
    @IsOptional()
    @IsBoolean()
    saveRawJson?: boolean = false;
}

