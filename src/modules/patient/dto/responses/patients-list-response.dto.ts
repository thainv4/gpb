import { ApiProperty } from '@nestjs/swagger';
import { PatientResponseDto } from './patient-response.dto';

export interface GetPatientsResult {
    patients: PatientResponseDto[];
    total: number;
    limit: number;
    offset: number;
}

export class PatientsListResponseDto {
    @ApiProperty({ type: [PatientResponseDto], description: 'Danh sách bệnh nhân' })
    patients: PatientResponseDto[];

    @ApiProperty({ description: 'Tổng số bản ghi' })
    total: number;

    @ApiProperty({ description: 'Giới hạn bản ghi trên mỗi trang' })
    limit: number;

    @ApiProperty({ description: 'Số lượng bản ghi đã bỏ qua' })
    offset: number;
}
