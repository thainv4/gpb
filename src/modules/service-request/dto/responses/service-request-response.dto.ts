import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RequestRoomDto {
    @ApiProperty({ description: 'ID phòng yêu cầu', example: 5707 })
    id: number;

    @ApiProperty({ description: 'Mã phòng yêu cầu', example: 'C2VTMBB03' })
    code: string;

    @ApiProperty({ description: 'Tên phòng yêu cầu', example: 'Phòng 3' })
    name: string;
    @ApiPropertyOptional({ description: 'ID phòng trong LIS (UUID) nếu map được, ngược lại null', example: 'c6d3c3a1-...' })
    lisRoomId?: string | null;
}

export class RequestDepartmentDto {
    @ApiProperty({ description: 'ID khoa yêu cầu', example: 104 })
    id: number;

    @ApiProperty({ description: 'Mã khoa yêu cầu', example: 'BMKP39.2' })
    code: string;

    @ApiProperty({ description: 'Tên khoa yêu cầu', example: 'C2 - Viện Tim Mạch' })
    name: string;
    @ApiPropertyOptional({ description: 'ID khoa trong LIS (UUID) nếu map được, ngược lại null', example: 'c6d3c3a1-...' })
    lisDepartmentId?: string | null;
}

export class ExecuteRoomDto {
    @ApiProperty({ description: 'ID phòng thực hiện', example: 410 })
    id: number;

    @ApiProperty({ description: 'Mã phòng thực hiện', example: 'P168' })
    code: string;

    @ApiProperty({ description: 'Tên phòng thực hiện', example: 'Phòng Xét Nghiệm Sinh Hóa' })
    name: string;
    @ApiPropertyOptional({ description: 'ID phòng trong LIS (UUID) nếu map được, ngược lại null', example: 'c6d3c3a1-...' })
    lisRoomId?: string | null;
}

export class ExecuteDepartmentDto {
    @ApiProperty({ description: 'ID khoa thực hiện', example: 58 })
    id: number;

    @ApiProperty({ description: 'Mã khoa thực hiện', example: '37' })
    code: string;

    @ApiProperty({ description: 'Tên khoa thực hiện', example: 'Khoa Hóa Sinh' })
    name: string;
    @ApiPropertyOptional({ description: 'ID khoa trong LIS (UUID) nếu map được, ngược lại null', example: 'c6d3c3a1-...' })
    lisDepartmentId?: string | null;
}

export class PatientDto {
    @ApiProperty({ description: 'ID bệnh nhân', example: 3151131 })
    id: number;

    @ApiProperty({ description: 'Mã bệnh nhân', example: '0003151004' })
    code: string;

    @ApiProperty({ description: 'Tên bệnh nhân', example: 'VŨ THỊ CẠY' })
    name: string;

    @ApiProperty({ description: 'Ngày sinh (YYYYMMDD)', example: 19560318000000 })
    dob: number;

    @ApiPropertyOptional({ description: 'Số CMND', example: '038156006752' })
    cmndNumber?: string;

    @ApiPropertyOptional({ description: 'Ngày cấp CMND (YYYYMMDD)', example: 20210422000000 })
    cmndDate?: number;

    @ApiPropertyOptional({ description: 'Nơi cấp CMND', example: 'Hà Nội' })
    cmndPlace?: string;

    @ApiPropertyOptional({ description: 'Số điện thoại di động', example: '0977367032' })
    mobile?: string;

    @ApiPropertyOptional({ description: 'Số điện thoại cố định', example: '0393780165' })
    phone?: string;

    @ApiPropertyOptional({ description: 'ID tỉnh', example: null })
    provinceId?: number;

    @ApiPropertyOptional({ description: 'Mã tỉnh', example: '38' })
    provinceCode?: string;

    @ApiPropertyOptional({ description: 'Tên tỉnh', example: 'Thanh Hóa' })
    provinceName?: string;
    @ApiPropertyOptional({ description: 'ID tỉnh trong LIS (UUID) nếu map được, ngược lại null', example: 'c6d3c3a1-...' })
    lisProvinceId?: string | null;

    @ApiPropertyOptional({ description: 'ID xã', example: null })
    wardId?: number;

    @ApiPropertyOptional({ description: 'Mã xã', example: '16033' })
    communeCode?: string;

    @ApiPropertyOptional({ description: 'Tên xã', example: 'Xã Đông Thành' })
    communeName?: string;
    @ApiPropertyOptional({ description: 'ID xã/phường trong LIS (UUID) nếu map được, ngược lại null', example: 'c6d3c3a1-...' })
    lisWardId?: string | null;

    @ApiPropertyOptional({ description: 'Địa chỉ', example: 'thôn đông thôn 1, Xã Đông Thành, Thanh Hóa' })
    address?: string;

    @ApiProperty({ description: 'ID giới tính', example: 1 })
    genderId: number;

    @ApiProperty({ description: 'Tên giới tính', example: 'Nữ' })
    genderName: string;

    @ApiPropertyOptional({ description: 'Nghề nghiệp', example: 'Không xác định' })
    careerName?: string;

    @ApiPropertyOptional({ description: 'ID bệnh nhân LIS', example: 'f393d537-03d9-4afe-a27b-e902a9945f13' })
    lisPatientId?: string;
}

export class ServiceTestDto {
    @ApiProperty({ description: 'ID xét nghiệm', example: '10f49beb-d1e1-4a08-8b56-62ce0c485e78' })
    id: string;

    @ApiProperty({ description: 'Mã xét nghiệm', example: 'TEST_001' })
    testCode: string;

    @ApiProperty({ description: 'Tên xét nghiệm', example: 'Xét nghiệm máu tổng quát' })
    testName: string;

    @ApiPropertyOptional({ description: 'Tên viết tắt', example: 'XN Máu TQ' })
    shortName?: string;

    @ApiPropertyOptional({ description: 'Mô tả', example: 'Xét nghiệm máu tổng quát cơ bản' })
    description?: string;

    @ApiPropertyOptional({ description: 'ID đơn vị tính', example: '2862cd01-5a13-4404-be5c-2b537c9d0e12' })
    unitOfMeasureId?: string;

    @ApiPropertyOptional({ description: 'Mã đơn vị tính', example: 'UOM_ML' })
    unitOfMeasureCode?: string;

    @ApiPropertyOptional({ description: 'Tên đơn vị tính', example: 'Lan' })
    unitOfMeasureName?: string;

    @ApiPropertyOptional({ description: 'Khoảng giá trị', example: 'Bình thường: 3.5-5.5 g/dL' })
    rangeText?: string;

    @ApiPropertyOptional({ description: 'Giá trị thấp nhất', example: 3.5 })
    rangeLow?: number;

    @ApiPropertyOptional({ description: 'Giá trị cao nhất', example: 5.5 })
    rangeHigh?: number;

    @ApiPropertyOptional({ description: 'Mapping JSON', example: '{"hisCode": "BM00132", "externalSystem": "LIS"}' })
    mapping?: string;

    @ApiProperty({ description: 'Thứ tự xét nghiệm', example: 1 })
    testOrder: number;

    @ApiProperty({ description: 'Giá xét nghiệm', example: 50000 })
    price: number;

    @ApiProperty({ description: 'Trạng thái hoạt động', example: 1 })
    isActive: number;

    @ApiProperty({ description: 'Ngày tạo', example: '2024-01-15T10:30:00Z' })
    createdAt: Date;

    @ApiProperty({ description: 'Ngày cập nhật', example: '2024-01-15T10:30:00Z' })
    updatedAt: Date;

    @ApiPropertyOptional({ description: 'Người tạo', example: 'admin' })
    createdBy?: string;

    @ApiPropertyOptional({ description: 'Người cập nhật', example: 'admin' })
    updatedBy?: string;

    @ApiProperty({ description: 'Phiên bản', example: 1 })
    version: number;
}

export class LisServiceDto {
    @ApiProperty({ description: 'ID dịch vụ LIS', example: '16fca2f6-5d49-4fbb-97ef-be50654b04b6' })
    id: string;

    @ApiProperty({ description: 'Mã dịch vụ LIS', example: 'LAB_002' })
    serviceCode: string;

    @ApiProperty({ description: 'Tên dịch vụ LIS', example: 'Dinh luong Cortisol' })
    serviceName: string;

    @ApiPropertyOptional({ description: 'Tên viết tắt', example: 'Cortisol' })
    shortName?: string;

    @ApiProperty({ description: 'Giá hiện tại', example: 100000 })
    currentPrice: number;

    @ApiPropertyOptional({ description: 'ID nhóm dịch vụ', example: '995eb5d3-6d8a-4c09-b1f3-25742854469b' })
    serviceGroupId?: string;

    @ApiPropertyOptional({ description: 'Tên nhóm dịch vụ', example: 'Laboratory Services' })
    serviceGroupName?: string;

    @ApiPropertyOptional({ description: 'ID đơn vị tính', example: '2862cd01-5a13-4404-be5c-2b537c9d0e12' })
    unitOfMeasureId?: string;

    @ApiPropertyOptional({ description: 'Mã đơn vị tính', example: 'UOM_ML' })
    unitOfMeasureCode?: string;

    @ApiPropertyOptional({ description: 'Tên đơn vị tính', example: 'Lan' })
    unitOfMeasureName?: string;

    @ApiPropertyOptional({ description: 'Mapping JSON', example: '{"hisCode": "BM02129", "externalSystem": "LIS"}' })
    mapping?: string;

    @ApiProperty({ description: 'Trạng thái hoạt động', example: true })
    isActive: boolean;

    @ApiProperty({ description: 'Ngày tạo', example: '2024-01-15T10:30:00Z' })
    createdAt: Date;

    @ApiProperty({ description: 'Ngày cập nhật', example: '2024-01-15T10:30:00Z' })
    updatedAt: Date;

    @ApiPropertyOptional({ description: 'Người tạo', example: 'admin' })
    createdBy?: string;

    @ApiPropertyOptional({ description: 'Người cập nhật', example: 'admin' })
    updatedBy?: string;

    @ApiProperty({ description: 'Phiên bản', example: 1 })
    version: number;

    @ApiProperty({ description: 'Danh sách xét nghiệm con', type: [ServiceTestDto] })
    serviceTests: ServiceTestDto[];
}

export class ServiceDto {
    @ApiProperty({ description: 'ID chi tiết dịch vụ HIS', example: 112778657 })
    hisSereServId: number;

    @ApiProperty({ description: 'ID dịch vụ', example: 5929 })
    serviceId: number;

    @ApiProperty({ description: 'Mã dịch vụ', example: 'BM02129' })
    serviceCode: string;

    @ApiProperty({ description: 'Tên dịch vụ', example: 'Định lượng Cortisol' })
    serviceName: string;

    @ApiProperty({ description: 'Giá dịch vụ', example: 95300 })
    price: number;

    @ApiPropertyOptional({ description: 'ID dịch vụ trong LIS (UUID) nếu map được theo SERVICE_CODE và là dịch vụ cha (PARENT_SERVICE_ID null), ngược lại null' })
    lisServiceId?: string | null;

    @ApiPropertyOptional({ description: 'ID đơn vị tính', example: 'uuid' })
    unitOfMeasureId?: string | null;

    @ApiPropertyOptional({ description: 'Mã đơn vị tính', example: 'UOM_ML' })
    unitOfMeasureCode?: string | null;

    @ApiPropertyOptional({ description: 'Tên đơn vị tính', example: 'Milliliter' })
    unitOfMeasureName?: string | null;

    @ApiPropertyOptional({ description: 'Khoảng giá trị', example: 'Bình thường: 3.5-5.5 g/dL' })
    rangeText?: string | null;

    @ApiPropertyOptional({ description: 'Giá trị thấp nhất', example: 3.5 })
    rangeLow?: number | null;

    @ApiPropertyOptional({ description: 'Giá trị cao nhất', example: 5.5 })
    rangeHigh?: number | null;

    @ApiPropertyOptional({ description: 'Mapping JSON', example: '{"hisCode": "BM02129", "externalSystem": "LIS"}' })
    mapping?: string | null;

    @ApiPropertyOptional({ description: 'Thứ tự dịch vụ', example: 1 })
    testOrder?: number | null;

    @ApiPropertyOptional({ description: 'Dịch vụ LIS mapping', type: LisServiceDto })
    lisService?: LisServiceDto;

    @ApiPropertyOptional({ description: 'Danh sách xét nghiệm con (chỉ trả khi có dịch vụ con LIS)', type: [ServiceTestDto] })
    serviceTests?: ServiceTestDto[];
}

export class ServiceRequestResponseDto {
    @ApiProperty({ description: 'ID yêu cầu dịch vụ', example: 55537570 })
    id: number;

    @ApiProperty({ description: 'Mã yêu cầu dịch vụ', example: '000055537395' })
    serviceReqCode: string;

    @ApiProperty({ description: 'ID trạng thái yêu cầu', example: 3 })
    serviceReqSttId: number;

    @ApiProperty({ description: 'Mã trạng thái yêu cầu', example: '03' })
    serviceReqSttCode: string;

    @ApiProperty({ description: 'ID loại yêu cầu', example: 2 })
    serviceReqTypeId: number;

    @ApiProperty({ description: 'Mã loại yêu cầu', example: 'XN' })
    serviceReqTypeCode: string;

    @ApiProperty({ description: 'Thời gian chỉ định', example: 20251014085800 })
    instructionTime: number;

    @ApiProperty({ description: 'Ngày chỉ định', example: 20251014000000 })
    instructionDate: number;

    @ApiPropertyOptional({ description: 'Mã ICD', example: 'M48.5' })
    icdCode?: string;

    @ApiPropertyOptional({ description: 'Tên ICD', example: 'Xẹp đốt sống- Xẹp D12/THA- TBMMN - Suy thượng thận' })
    icdName?: string;

    @ApiPropertyOptional({ description: 'Mã ICD phụ', example: null })
    icdSubCode?: string;

    @ApiPropertyOptional({ description: 'Mô tả ICD', example: null })
    icdText?: string;

    @ApiProperty({ description: 'ID điều trị', example: 5230319 })
    treatmentId: number;

    @ApiProperty({ description: 'Mã điều trị', example: '000005230244' })
    treatmentCode: string;

    @ApiPropertyOptional({ description: 'Ghi chú', example: null })
    note?: string;

    @ApiProperty({ description: 'Thông tin phòng yêu cầu', type: RequestRoomDto })
    requestRoom: RequestRoomDto;

    @ApiProperty({ description: 'Thông tin khoa yêu cầu', type: RequestDepartmentDto })
    requestDepartment: RequestDepartmentDto;

    @ApiProperty({ description: 'Thông tin phòng thực hiện', type: ExecuteRoomDto })
    executeRoom: ExecuteRoomDto;

    @ApiProperty({ description: 'Thông tin khoa thực hiện', type: ExecuteDepartmentDto })
    executeDepartment: ExecuteDepartmentDto;

    @ApiProperty({ description: 'Thông tin bệnh nhân', type: PatientDto })
    patient: PatientDto;

    @ApiProperty({ description: 'Danh sách dịch vụ', type: [ServiceDto] })
    services: ServiceDto[];
}
