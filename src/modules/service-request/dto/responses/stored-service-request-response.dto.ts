import { ApiProperty } from '@nestjs/swagger';

export class StoredServiceRequestResponseDto {
    @ApiProperty({ description: 'ID Service Request đã lưu', example: 'uuid-stored-sr-001' })
    id: string;

    @ApiProperty({ description: 'Mã Service Request', example: '000055537395' })
    serviceReqCode: string;

    @ApiProperty({ description: 'Số lượng services đã lưu', example: 14 })
    servicesCount: number;

    @ApiProperty({ description: 'Thời gian lưu', example: '2025-11-01T10:30:00Z' })
    storedAt: Date;

    @ApiProperty({ description: 'Workflow đã được tự động khởi tạo', example: true })
    workflowStarted: boolean;
}

