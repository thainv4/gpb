import { IsNotEmpty, IsString, IsOptional, IsNumber, IsIn, IsUUID, MaxLength, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class EnterResultDto {
    @ApiPropertyOptional({ description: 'Giá trị kết quả (số)', example: 12.5 })
    @IsOptional()
    @IsNumber({}, { message: 'Giá trị kết quả phải là số' })
    @Type(() => Number)
    resultValue?: number;

    @ApiPropertyOptional({ description: 'Giá trị kết quả (text)', example: '12.5', maxLength: 500 })
    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Giá trị kết quả text không được quá 500 ký tự' })
    resultValueText?: string;

    @ApiPropertyOptional({ description: 'Kết quả xét nghiệm chi tiết (CLOB)' })
    @IsOptional()
    @IsString()
    resultText?: string;

    @ApiProperty({
        description: 'Trạng thái kết quả',
        enum: ['NORMAL', 'ABNORMAL', 'CRITICAL', 'PENDING'],
        example: 'NORMAL'
    })
    @IsNotEmpty({ message: 'Trạng thái kết quả là bắt buộc' })
    @IsString()
    @IsIn(['NORMAL', 'ABNORMAL', 'CRITICAL', 'PENDING'], { message: 'Trạng thái kết quả không hợp lệ' })
    resultStatus: string;

    @ApiPropertyOptional({ description: 'Ghi chú về kết quả', maxLength: 1000 })
    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: 'Ghi chú không được quá 1000 ký tự' })
    resultNotes?: string;

    @ApiPropertyOptional({ description: 'JSON metadata (máy xét nghiệm, method, etc.)' })
    @IsOptional()
    @IsString()
    resultMetadata?: string;
}

