import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateResultTemplateDto {
    @ApiProperty({
        description: 'Mã mẫu kết quả',
        example: 'RT001',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50, { message: 'Mã mẫu kết quả không được quá 50 ký tự' })
    resultTemplateCode: string;

    @ApiProperty({
        description: 'Tên mẫu kết quả',
        example: 'Mẫu xét nghiệm máu',
    })
    @IsString()
    @IsNotEmpty()
    templateName: string;

    @ApiPropertyOptional({
        description: 'Mô tả kết quả',
        example: 'Mô tả chi tiết về kết quả xét nghiệm',
        maxLength: 500
    })
    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Mô tả kết quả không được quá 500 ký tự' })
    resultDescription?: string;

    @ApiPropertyOptional({
        description: 'Kết luận',
        example: 'Kết luận về kết quả xét nghiệm',
        maxLength: 500
    })
    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Kết luận không được quá 500 ký tự' })
    resultConclude?: string;

    @ApiPropertyOptional({
        description: 'Ghi chú kết quả',
        example: 'Ghi chú về kết quả xét nghiệm',
        maxLength: 500
    })
    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Ghi chú kết quả không được quá 500 ký tự' })
    resultNote?: string;
}

