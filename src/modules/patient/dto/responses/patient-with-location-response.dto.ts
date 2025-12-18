import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PatientResponseDto } from './patient-response.dto';

export class PatientWithLocationResponseDto extends PatientResponseDto {
    @ApiPropertyOptional({ description: 'Thông tin tỉnh' })
    province?: {
        id: string;
        provinceCode: string;
        provinceName: string;
        shortName: string;
    };

    @ApiPropertyOptional({ description: 'Thông tin phường/xã' })
    ward?: {
        id: string;
        wardCode: string;
        wardName: string;
        shortName: string;
        provinceId: string;
    };
}
