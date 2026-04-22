import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';
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

    @ApiPropertyOptional({
        description: 'ID loại bệnh phẩm (BML_SAMPLE_TYPES.ID)',
        example: 'f32c11f9-cab8-4f72-9776-5b41a1bc89e8',
    })
    @IsOptional()
    @IsString()
    @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
        message: 'ID loại bệnh phẩm phải là UUID hợp lệ',
    })
    sampleTypeId?: string | null;
}

