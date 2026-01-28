import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Thông tin yêu cầu xét nghiệm kèm theo khi lấy kết quả (GET /result).
 */
export class ResultRequestDto {
    @ApiProperty({ description: 'ID Service Request đã lưu' })
    storedRequestId: string;

    @ApiProperty({ description: 'Mã Service Request' })
    serviceReqCode: string;

    @ApiProperty({ description: 'ID Service/Test (BML_STORED_SR_SERVICES)' })
    serviceId: string;

    @ApiPropertyOptional({ description: 'Mã service' })
    serviceCode?: string;

    @ApiPropertyOptional({ description: 'Tên service' })
    serviceName?: string;

    @ApiPropertyOptional({ description: 'Instruction Date' })
    instructionDate?: number;

    @ApiPropertyOptional({ description: 'Instruction Time' })
    instructionTime?: number;

    @ApiPropertyOptional({ description: 'Patient ID' })
    patientId?: number;

    @ApiPropertyOptional({ description: 'Patient Code' })
    patientCode?: string;

    @ApiPropertyOptional({ description: 'Patient Name' })
    patientName?: string;

    @ApiPropertyOptional({ description: 'Patient DOB' })
    patientDob?: number;

    @ApiPropertyOptional({ description: 'Request Room Code' })
    requestRoomCode?: string;

    @ApiPropertyOptional({ description: 'Request Room Name' })
    requestRoomName?: string;

    @ApiPropertyOptional({ description: 'Request Department Code' })
    requestDepartmentCode?: string;

    @ApiPropertyOptional({ description: 'Request Department Name' })
    requestDepartmentName?: string;

    @ApiPropertyOptional({ description: 'ICD Code' })
    icdCode?: string;

    @ApiPropertyOptional({ description: 'ICD Name' })
    icdName?: string;

    @ApiPropertyOptional({ description: 'Treatment Code' })
    treatmentCode?: string;

    @ApiPropertyOptional({ description: 'Ghi chú yêu cầu' })
    note?: string;
}
