import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateResultTemplateDto {
    @ApiProperty({
        description: 'Tên mẫu kết quả',
        example: 'Mẫu xét nghiệm máu',
        required: false
    })
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(255)
    templateName?: string;

    @ApiProperty({
        description: 'Mẫu văn bản kết quả xét nghiệm (unique)',
        example: 'Kết quả xét nghiệm tổng quát: {{param1}}, {{param2}}',
        required: false
    })
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(2000)
    resultTextTemplate?: string;
}

