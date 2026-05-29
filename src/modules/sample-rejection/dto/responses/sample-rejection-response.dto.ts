import { ApiProperty } from '@nestjs/swagger';

export class SampleRejectionResponseDto {
    @ApiProperty({ description: 'ID bản ghi' })
    id: string;

    @ApiProperty({ description: 'Họ và tên bệnh nhân' })
    patientName: string;

    @ApiProperty({ description: 'Sinh nhật (YYYY-MM-DD)' })
    dateOfBirth: string;

    @ApiProperty({ description: 'Giới tính' })
    gender: string;

    @ApiProperty({ description: 'Chẩn đoán bệnh' })
    diagnosis: string;

    @ApiProperty({ description: 'Chỉ định xét nghiệm' })
    testIndication: string;

    @ApiProperty({ description: 'Bác sĩ chỉ định' })
    orderingDoctor: string;

    @ApiProperty({ description: 'Địa chỉ bệnh nhân' })
    patientAddress: string;

    @ApiProperty({ description: 'Mã bệnh phẩm' })
    sampleCode: string;

    @ApiProperty({ description: 'Vị trí lấy mẫu' })
    samplingSite: string;

    @ApiProperty({ description: 'Phương pháp lấy mẫu' })
    samplingMethod: string;

    @ApiProperty({ description: 'Thời gian từ chối' })
    rejectionTime: Date;

    @ApiProperty({ description: 'Lý do từ chối' })
    rejectionReason: string;

    @ApiProperty({ description: 'Ngày tạo' })
    createdAt: Date;

    @ApiProperty({ description: 'Ngày cập nhật' })
    updatedAt: Date;

    @ApiProperty({ description: 'Người tạo', nullable: true })
    createdBy?: string | null;

    @ApiProperty({ description: 'Người cập nhật', nullable: true })
    updatedBy?: string | null;

    @ApiProperty({ description: 'Phiên bản' })
    version: number;
}
