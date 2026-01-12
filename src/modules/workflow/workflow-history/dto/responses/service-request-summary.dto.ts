import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ServiceRequestSummaryDto {
    @ApiProperty({ description: 'ID Service Request đã lưu' })
    id: string;

    @ApiProperty({ description: 'Mã Service Request từ HIS' })
    hisServiceReqCode: string;

    @ApiProperty({ description: 'Mã Service Request' })
    serviceReqCode: string;

    @ApiPropertyOptional({ description: 'Service Request Status Code' })
    serviceReqSttCode?: string;

    @ApiPropertyOptional({ description: 'Service Request Type Code' })
    serviceReqTypeCode?: string;

    // Patient Info
    @ApiPropertyOptional({ description: 'Mã bệnh nhân' })
    patientCode?: string;

    @ApiPropertyOptional({ description: 'Tên bệnh nhân' })
    patientName?: string;

    @ApiPropertyOptional({ description: 'Ngày sinh bệnh nhân' })
    patientDob?: number;

    @ApiPropertyOptional({ description: 'Giới tính bệnh nhân' })
    patientGenderName?: string;

    // Location Info
    @ApiPropertyOptional({ description: 'Mã phòng yêu cầu' })
    requestRoomCode?: string;

    @ApiPropertyOptional({ description: 'Tên phòng yêu cầu' })
    requestRoomName?: string;

    @ApiPropertyOptional({ description: 'Mã khoa yêu cầu' })
    requestDepartmentCode?: string;

    @ApiPropertyOptional({ description: 'Tên khoa yêu cầu' })
    requestDepartmentName?: string;

    @ApiPropertyOptional({ description: 'Mã phòng thực hiện' })
    executeRoomCode?: string;

    @ApiPropertyOptional({ description: 'Tên phòng thực hiện' })
    executeRoomName?: string;

    @ApiPropertyOptional({ description: 'Mã khoa thực hiện' })
    executeDepartmentCode?: string;

    @ApiPropertyOptional({ description: 'Tên khoa thực hiện' })
    executeDepartmentName?: string;

    // Timing Info
    @ApiPropertyOptional({ description: 'Thời gian chỉ định' })
    instructionTime?: number;

    @ApiPropertyOptional({ description: 'Ngày chỉ định' })
    instructionDate?: number;

    @ApiPropertyOptional({ description: 'Thời gian lưu trữ' })
    storedAt?: Date;

    // ICD Info
    @ApiPropertyOptional({ description: 'ICD Code' })
    icdCode?: string;

    @ApiPropertyOptional({ description: 'ICD Name' })
    icdName?: string;

    @ApiPropertyOptional({ description: 'Treatment Code' })
    treatmentCode?: string;

    @ApiPropertyOptional({ description: 'Reception Code' })
    receptionCode?: string | null;
}

