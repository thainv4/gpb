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

    @ApiPropertyOptional({ description: 'Bác sĩ chỉ định — họ tên (REQUEST_USERNAME)' })
    requestUsername?: string | null;

    @ApiPropertyOptional({ description: 'Bác sĩ chỉ định — login (REQUEST_LOGINNAME)' })
    requestLoginname?: string | null;

    @ApiPropertyOptional({ description: 'Vị trí bệnh phẩm (BML_SAMPLE_TYPES.TYPE_NAME qua SAMPLE_TYPE_ID)' })
    sampleTypeName?: string | null;

    @ApiPropertyOptional({
        description: 'Kết luận plain text (từ BML_STORED_SR_SERVICES.RESULT_CONCLUDE, đã bỏ HTML)',
    })
    resultConclude?: string | null;

    @ApiPropertyOptional({ description: 'Phân loại bệnh phẩm (FLAG từ BML_STORED_SERVICE_REQUESTS)' })
    flag?: string | null;

    @ApiPropertyOptional({ description: 'Tên trạng thái đích (toState)' })
    stateName?: string | null;

    @ApiPropertyOptional({ description: 'Người thực hiện — họ tên (từ CREATED_BY → User), đồng bộ cột trên màn hình xem trước' })
    performerFullName?: string | null;

    @ApiPropertyOptional({ description: 'Người thực hiện — tên đăng nhập' })
    performerUserName?: string | null;

    @ApiPropertyOptional({ description: 'Thời điểm ghi nhận trạng thái (actionTimestamp), ISO 8601' })
    stateActionAt?: string | null;
}
