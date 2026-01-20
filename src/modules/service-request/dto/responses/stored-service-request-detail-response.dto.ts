import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StoredServiceResponseDto {
    @ApiProperty({ description: 'ID Service đã lưu' })
    id: string;

    @ApiProperty({ description: 'ID Service Request cha' })
    parentServiceId?: string | null;

    @ApiProperty({ description: 'Loại service: 0 = parent, 1 = child' })
    isChildService: number;

    // HIS Service Info
    @ApiPropertyOptional({ description: 'HIS Service ID' })
    hisSereServId?: number;

    @ApiPropertyOptional({ description: 'Service ID' })
    serviceId?: number;

    @ApiPropertyOptional({ description: 'Mã service' })
    serviceCode?: string;

    @ApiPropertyOptional({ description: 'Tên service' })
    serviceName?: string;

    @ApiPropertyOptional({ description: 'Giá' })
    price?: number;

    // LIS Service Info
    @ApiPropertyOptional({ description: 'LIS Service ID' })
    lisServiceId?: string | null;

    @ApiPropertyOptional({ description: 'Unit of Measure ID' })
    unitOfMeasureId?: string | null;

    @ApiPropertyOptional({ description: 'Unit of Measure Code' })
    unitOfMeasureCode?: string | null;

    @ApiPropertyOptional({ description: 'Unit of Measure Name' })
    unitOfMeasureName?: string | null;

    @ApiPropertyOptional({ description: 'Range Text' })
    rangeText?: string | null;

    @ApiPropertyOptional({ description: 'Range Low' })
    rangeLow?: number | null;

    @ApiPropertyOptional({ description: 'Range High' })
    rangeHigh?: number | null;

    @ApiPropertyOptional({ description: 'Mapping' })
    mapping?: string | null;

    @ApiPropertyOptional({ description: 'Test Order' })
    testOrder?: number | null;

    @ApiPropertyOptional({ description: 'Short Name' })
    shortName?: string | null;

    @ApiPropertyOptional({ description: 'Description' })
    description?: string | null;

    @ApiPropertyOptional({ description: 'Mô tả kết quả' })
    resultDescription?: string | null;

    @ApiPropertyOptional({ description: 'Kết luận' })
    resultConclude?: string | null;

    @ApiPropertyOptional({ description: 'Ghi chú kết quả' })
    resultNote?: string | null;

    @ApiPropertyOptional({ description: 'Kết quả xét nghiệm (CLOB)' })
    resultText?: string | null;

    @ApiPropertyOptional({ description: 'Tên kết quả xét nghiệm' })
    resultName?: string | null;

    // Result Value & Status
    @ApiPropertyOptional({ description: 'Giá trị kết quả (số)' })
    resultValue?: number | null;

    @ApiPropertyOptional({ description: 'Giá trị kết quả (text)' })
    resultValueText?: string | null;

    @ApiPropertyOptional({ description: 'Trạng thái kết quả', enum: ['NORMAL', 'ABNORMAL', 'CRITICAL', 'PENDING'] })
    resultStatus?: string | null;

    @ApiPropertyOptional({ description: '1 = bình thường, 0 = bất thường' })
    isNormal?: number | null;

    // Result Timestamps
    @ApiPropertyOptional({ description: 'Thời gian nhập kết quả' })
    resultEnteredAt?: Date | null;

    @ApiPropertyOptional({ description: 'Thời gian review' })
    resultReviewedAt?: Date | null;

    @ApiPropertyOptional({ description: 'Thời gian phê duyệt' })
    resultApprovedAt?: Date | null;

    @ApiPropertyOptional({ description: 'Thời gian hoàn thành' })
    resultCompletedAt?: Date | null;

    // Result Users
    @ApiPropertyOptional({ description: 'User nhập kết quả' })
    resultEnteredByUserId?: string | null;

    @ApiPropertyOptional({ description: 'User review' })
    resultReviewedByUserId?: string | null;

    @ApiPropertyOptional({ description: 'User phê duyệt' })
    resultApprovedByUserId?: string | null;

    @ApiPropertyOptional({ description: 'JSON metadata' })
    resultMetadata?: string | null;

    // Quality Control
    @ApiPropertyOptional({ description: 'QC Status', enum: ['PASSED', 'FAILED', 'PENDING'] })
    qcStatus?: string | null;

    @ApiPropertyOptional({ description: 'User kiểm tra QC' })
    qcCheckedByUserId?: string | null;

    @ApiPropertyOptional({ description: 'Thời gian kiểm tra QC' })
    qcCheckedAt?: Date | null;

    // Sample Collection Info
    @ApiPropertyOptional({ description: 'Mã tiếp nhận mẫu' })
    receptionCode?: string | null;

    @ApiPropertyOptional({ description: 'Tên loại mẫu' })
    sampleTypeName?: string | null;

    @ApiPropertyOptional({ description: 'ID loại mẫu' })
    sampleTypeId?: string | null;

    @ApiPropertyOptional({ description: 'Thời gian lấy mẫu' })
    sampleCollectionTime?: Date | null;

    @ApiPropertyOptional({ description: 'ID user lấy mẫu' })
    collectedByUserId?: string | null;

    // EMR Document ID
    @ApiPropertyOptional({ description: 'ID văn bản EMR (từ bảng EMR_DOCUMENT)' })
    documentId?: number | null;

    // Staining Method
    @ApiPropertyOptional({ description: 'Tên phương pháp nhuộm' })
    stainingMethodName?: string | null;

    // Child-specific fields
    @ApiPropertyOptional({ description: 'Test ID (cho child services)' })
    testId?: string | null;

    @ApiPropertyOptional({ description: 'Is Active' })
    isActive?: number | null;

    // Child tests (nested)
    @ApiPropertyOptional({ description: 'Danh sách child tests', type: [StoredServiceResponseDto] })
    serviceTests?: StoredServiceResponseDto[];
}

export class WorkflowCurrentStateDto {
    @ApiProperty({ description: 'ID Workflow History' })
    id: string;

    @ApiProperty({ description: 'ID State hiện tại' })
    toStateId: string;

    @ApiPropertyOptional({ description: 'State Code' })
    stateCode?: string;

    @ApiPropertyOptional({ description: 'State Name' })
    stateName?: string;

    @ApiProperty({ description: 'Action Type' })
    actionType: string;

    @ApiProperty({ description: 'Thời gian bắt đầu' })
    startedAt: Date;

    @ApiPropertyOptional({ description: 'Thời gian action' })
    actionTimestamp?: Date;

    @ApiPropertyOptional({ description: 'Thời gian hoàn thành' })
    completedAt?: Date | null;

    @ApiProperty({ description: 'Có phải current state không' })
    isCurrent: number;

    @ApiPropertyOptional({ description: 'Ghi chú' })
    notes?: string | null;
}

export class StoredServiceRequestDetailResponseDto {
    // Base Info
    @ApiProperty({ description: 'ID Service Request đã lưu' })
    id: string;

    @ApiProperty({ description: 'Mã Service Request từ HIS' })
    hisServiceReqCode: string;

    @ApiPropertyOptional({ description: 'ID Service Request từ HIS' })
    hisServiceReqId?: number;

    @ApiProperty({ description: 'Mã Service Request' })
    serviceReqCode: string;

    @ApiPropertyOptional({ description: 'Service Request Status ID' })
    serviceReqSttId?: number;

    @ApiPropertyOptional({ description: 'Service Request Status Code' })
    serviceReqSttCode?: string;

    @ApiPropertyOptional({ description: 'Service Request Type ID' })
    serviceReqTypeId?: number;

    @ApiPropertyOptional({ description: 'Service Request Type Code' })
    serviceReqTypeCode?: string;

    @ApiPropertyOptional({ description: 'Instruction Time' })
    instructionTime?: number;

    @ApiPropertyOptional({ description: 'Instruction Date' })
    instructionDate?: number;

    // ICD Info
    @ApiPropertyOptional({ description: 'ICD Code' })
    icdCode?: string;

    @ApiPropertyOptional({ description: 'ICD Name' })
    icdName?: string;

    @ApiPropertyOptional({ description: 'ICD Sub Code' })
    icdSubCode?: string;

    @ApiPropertyOptional({ description: 'ICD Text' })
    icdText?: string;

    // Treatment Info
    @ApiPropertyOptional({ description: 'Treatment ID' })
    treatmentId?: number;

    @ApiPropertyOptional({ description: 'Treatment Code' })
    treatmentCode?: string;

    @ApiPropertyOptional({ description: 'Note' })
    note?: string;

    // Request Room & Department
    @ApiPropertyOptional({ description: 'Request Room ID' })
    requestRoomId?: string;

    @ApiPropertyOptional({ description: 'Request Room Code' })
    requestRoomCode?: string;

    @ApiPropertyOptional({ description: 'Request Room Name' })
    requestRoomName?: string;

    @ApiPropertyOptional({ description: 'Request Room LIS ID' })
    requestRoomLisId?: string | null;

    @ApiPropertyOptional({ description: 'Request Department ID' })
    requestDepartmentId?: string;

    @ApiPropertyOptional({ description: 'Request Department Code' })
    requestDepartmentCode?: string;

    @ApiPropertyOptional({ description: 'Request Department Name' })
    requestDepartmentName?: string;

    @ApiPropertyOptional({ description: 'Request Department LIS ID' })
    requestDepartmentLisId?: string | null;

    // Execute Room & Department
    @ApiPropertyOptional({ description: 'Execute Room ID' })
    executeRoomId?: string;

    @ApiPropertyOptional({ description: 'Execute Room Code' })
    executeRoomCode?: string;

    @ApiPropertyOptional({ description: 'Execute Room Name' })
    executeRoomName?: string;

    @ApiPropertyOptional({ description: 'Execute Room LIS ID' })
    executeRoomLisId?: string | null;

    @ApiPropertyOptional({ description: 'Execute Department ID' })
    executeDepartmentId?: string;

    @ApiPropertyOptional({ description: 'Execute Department Code' })
    executeDepartmentCode?: string;

    @ApiPropertyOptional({ description: 'Execute Department Name' })
    executeDepartmentName?: string;

    @ApiPropertyOptional({ description: 'Execute Department LIS ID' })
    executeDepartmentLisId?: string | null;

    // Current Room & Department (NEW)
    @ApiPropertyOptional({ description: 'Current Room ID' })
    currentRoomId?: string | null;

    @ApiPropertyOptional({ description: 'Current Department ID' })
    currentDepartmentId?: string | null;

    // Patient Info
    @ApiPropertyOptional({ description: 'Patient ID' })
    patientId?: string;

    @ApiPropertyOptional({ description: 'Patient Code' })
    patientCode?: string;

    @ApiPropertyOptional({ description: 'Patient Name' })
    patientName?: string;

    @ApiPropertyOptional({ description: 'Patient DOB' })
    patientDob?: number;

    @ApiPropertyOptional({ description: 'Patient CMND Number' })
    patientCmndNumber?: string | null;

    @ApiPropertyOptional({ description: 'Patient CMND Date' })
    patientCmndDate?: number | null;

    @ApiPropertyOptional({ description: 'Patient CMND Place' })
    patientCmndPlace?: string | null;

    @ApiPropertyOptional({ description: 'Patient Mobile' })
    patientMobile?: string | null;

    @ApiPropertyOptional({ description: 'Patient Phone' })
    patientPhone?: string | null;

    @ApiPropertyOptional({ description: 'Patient Province Code' })
    patientProvinceCode?: string | null;

    @ApiPropertyOptional({ description: 'Patient Province Name' })
    patientProvinceName?: string | null;

    @ApiPropertyOptional({ description: 'Patient Province LIS ID' })
    patientProvinceLisId?: string | null;

    @ApiPropertyOptional({ description: 'Patient Commune Code' })
    patientCommuneCode?: string | null;

    @ApiPropertyOptional({ description: 'Patient Commune Name' })
    patientCommuneName?: string | null;

    @ApiPropertyOptional({ description: 'Patient Commune LIS ID' })
    patientCommuneLisId?: string | null;

    @ApiPropertyOptional({ description: 'Patient Address' })
    patientAddress?: string | null;

    @ApiPropertyOptional({ description: 'Patient Gender ID' })
    patientGenderId?: number;

    @ApiPropertyOptional({ description: 'Patient Gender Name' })
    patientGenderName?: string;

    @ApiPropertyOptional({ description: 'Patient Career Name' })
    patientCareerName?: string | null;

    @ApiPropertyOptional({ description: 'Patient LIS ID' })
    patientLisId?: string | null;

    // Storage Info
    @ApiProperty({ description: 'Thời gian lưu' })
    storedAt: Date;

    @ApiPropertyOptional({ description: 'User lưu' })
    storedBy?: string;

    @ApiPropertyOptional({ description: 'Raw JSON response' })
    rawResponseJson?: string | null;

    @ApiPropertyOptional({ description: 'Staining Method ID' })
    stainingMethodId?: string | null;

    @ApiPropertyOptional({ description: 'Staining Method Name' })
    stainingMethodName?: string | null;

    // Services
    @ApiProperty({ description: 'Danh sách services', type: [StoredServiceResponseDto] })
    services: StoredServiceResponseDto[];

    // Workflow
    @ApiPropertyOptional({ description: 'Current Workflow State', type: WorkflowCurrentStateDto })
    workflowCurrentState?: WorkflowCurrentStateDto | null;

    // Audit Fields
    @ApiProperty({ description: 'Created At' })
    createdAt: Date;

    @ApiProperty({ description: 'Updated At' })
    updatedAt: Date;

    @ApiPropertyOptional({ description: 'Deleted At' })
    deletedAt?: Date | null;
}

