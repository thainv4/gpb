import { ApiPropertyOptional } from '@nestjs/swagger';
import { Hl7OutQueueListItemDto } from './hl7-out-queue-list-item.dto';

export class Hl7OutQueueDetailDto extends Hl7OutQueueListItemDto {
    @ApiPropertyOptional({ description: 'Họ bệnh nhân (PATIENT_FAMILY)' })
    patientFamily?: string | null;

    @ApiPropertyOptional({ description: 'Tên bệnh nhân (PATIENT_GIVEN)' })
    patientGiven?: string | null;

    @ApiPropertyOptional({ description: 'Ngày sinh YYYY-MM-DD (PATIENT_DOB)' })
    patientDob?: string | null;

    @ApiPropertyOptional({ description: 'Giới tính HL7 M/F (PATIENT_GENDER)' })
    patientGender?: string | null;
}
