import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Một dòng dữ liệu báo cáo (một WorkflowHistory), phẳng cho xuất Excel. */
export class WorkflowHistoryReportExportRowDto {
    @ApiProperty({ description: 'ID bản ghi workflow history' })
    workflowHistoryId: string;

    @ApiPropertyOptional({ description: 'Mã bệnh phẩm GPB (receptionCode theo dòng service)' })
    receptionCode?: string | null;

    @ApiProperty({ description: 'Mã y lệnh HIS' })
    hisServiceReqCode: string;

    @ApiProperty({ description: 'Mã service request nội bộ' })
    serviceReqCode: string;

    @ApiPropertyOptional({ description: 'Mã bệnh nhân' })
    patientCode?: string | null;

    @ApiPropertyOptional({ description: 'Họ tên bệnh nhân' })
    patientName?: string | null;

    @ApiPropertyOptional({ description: 'Chẩn đoán (ICD name)' })
    icdName?: string | null;

    @ApiPropertyOptional({ description: 'Bác sĩ chỉ định (REQUEST_USERNAME)' })
    requestUsername?: string | null;

    @ApiPropertyOptional({ description: 'Vị trí bệnh phẩm / loại mẫu' })
    sampleTypeName?: string | null;

    @ApiPropertyOptional({ description: 'Tên trạng thái đích (toState)' })
    stateName?: string | null;

    @ApiPropertyOptional({ description: 'Thời điểm ghi nhận trạng thái (actionTimestamp), ISO 8601' })
    stateActionAt?: string | null;
}
