import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateResultTemplateDto {
    @ApiPropertyOptional({
        description: 'Mã mẫu kết quả',
        example: 'RT001',
    })
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @MaxLength(50, { message: 'Mã mẫu kết quả không được quá 50 ký tự' })
    resultTemplateCode?: string;

    @ApiPropertyOptional({
        description: 'Tên mẫu kết quả',
        example: 'Mẫu xét nghiệm máu',
    })
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(255)
    templateName?: string;

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

