import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResultTemplateDto {
    @ApiProperty({
        description: 'Tên mẫu kết quả',
        example: 'Mẫu xét nghiệm máu',
    })
    @IsString()
    @IsNotEmpty()
    templateName: string;

    @ApiProperty({
        description: 'Mẫu văn bản kết quả xét nghiệm',
        example: 'Kết quả xét nghiệm tổng quát: {{param1}}, {{param2}}',
    })
    @IsString()
    @IsNotEmpty()
    resultTextTemplate: string;
}

