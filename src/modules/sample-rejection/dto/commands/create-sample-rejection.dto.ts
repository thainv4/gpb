import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateSampleRejectionDto {
    @ApiProperty({ description: 'Họ và tên bệnh nhân', example: 'Nguyễn Văn A' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    patientName: string;

    @ApiProperty({ description: 'Sinh nhật (YYYY-MM-DD)', example: '1990-05-15' })
    @IsDateString()
    @IsNotEmpty()
    dateOfBirth: string;

    @ApiProperty({ description: 'Giới tính', example: 'MALE', enum: ['MALE', 'FEMALE', 'OTHER'] })
    @IsString()
    @IsNotEmpty()
    @IsIn(['MALE', 'FEMALE', 'OTHER'])
    gender: string;

    @ApiProperty({ description: 'Chẩn đoán bệnh', example: 'U tuyến giáp' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    diagnosis: string;

    @ApiProperty({ description: 'Chỉ định xét nghiệm', example: 'Giải phẫu bệnh sinh thiết' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    testIndication: string;

    @ApiProperty({ description: 'Bác sĩ chỉ định', example: 'BS. Trần Văn B' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    orderingDoctor: string;

    @ApiProperty({ description: 'Địa chỉ bệnh nhân', example: '123 Đường ABC, Quận 1, TP.HCM' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    patientAddress: string;

    @ApiProperty({ description: 'Mã bệnh phẩm', example: 'G2605.0123' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    sampleCode: string;

    @ApiProperty({ description: 'Vị trí lấy mẫu', example: 'Tuyến giáp trái' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    samplingSite: string;

    @ApiProperty({ description: 'Phương pháp lấy mẫu', example: 'SINH THIẾT' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    samplingMethod: string;

    @ApiProperty({ description: 'Thời gian từ chối (ISO datetime)', example: '2026-05-29T14:30:00.000Z' })
    @IsDateString()
    @IsNotEmpty()
    rejectionTime: string;

    @ApiProperty({ description: 'Lý do từ chối', example: 'Mẫu không đủ lượng' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    rejectionReason: string;
}
