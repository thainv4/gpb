import { IsNotEmpty, IsString, IsOptional, IsNumber, IsIn, MaxLength, ValidateIf } from 'class-validator';
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

    @ApiPropertyOptional({ 
        description: 'Kết quả xét nghiệm chi tiết (CLOB). Có thể gửi null để xóa resultText.',
        nullable: true
    })
    @IsOptional()
    @ValidateIf((o, v) => v !== null)
    @IsString()
    resultText?: string | null;

    @ApiPropertyOptional({ description: 'Tên kết quả xét nghiệm', example: 'Kết quả xét nghiệm máu', maxLength: 200 })
    @IsOptional()
    @IsString()
    @MaxLength(200, { message: 'Tên kết quả không được quá 200 ký tự' })
    resultName?: string;

    @ApiProperty({
        description: 'Trạng thái kết quả',
        enum: ['NORMAL', 'ABNORMAL', 'CRITICAL', 'PENDING'],
        example: 'NORMAL'
    })
    @IsNotEmpty({ message: 'Trạng thái kết quả là bắt buộc' })
    @IsString()
    @IsIn(['NORMAL', 'ABNORMAL', 'CRITICAL', 'PENDING'], { message: 'Trạng thái kết quả không hợp lệ' })
    resultStatus: string;


    @ApiPropertyOptional({ description: 'JSON metadata (máy xét nghiệm, method, etc.)' })
    @IsOptional()
    @IsString()
    resultMetadata?: string;
}

