import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReceptionCodeDto {
    @ApiPropertyOptional({ 
        description: 'Mã tiếp nhận mới',
        example: 'RCP20251229001'
    })
    @IsOptional()
    @IsString()
    receptionCode?: string | null;

    @ApiPropertyOptional({ 
        description: 'Tên loại mẫu',
        example: 'Mẫu máu'
    })
    @IsOptional()
    @IsString()
    @MaxLength(200, { message: 'Tên loại mẫu không được quá 200 ký tự' })
    sampleTypeName?: string | null;
}

