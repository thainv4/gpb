import { IsNotEmpty, IsString, IsIn, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QcResultDto {
    @ApiProperty({
        description: 'QC Status',
        enum: ['PASSED', 'FAILED', 'PENDING'],
        example: 'PASSED'
    })
    @IsNotEmpty({ message: 'QC Status là bắt buộc' })
    @IsString()
    @IsIn(['PASSED', 'FAILED', 'PENDING'], { message: 'QC Status không hợp lệ' })
    qcStatus: string;

    @ApiPropertyOptional({ description: 'Ghi chú QC', maxLength: 1000 })
    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: 'Ghi chú QC không được quá 1000 ký tự' })
    notes?: string;
}

