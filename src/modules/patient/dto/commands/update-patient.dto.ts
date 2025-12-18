import { PartialType } from '@nestjs/swagger';
import { CreatePatientDto } from './create-patient.dto';

export class UpdatePatientDto extends PartialType(CreatePatientDto) {
    // Override patientCode to make it optional in updates
    patientCode?: string;
}
