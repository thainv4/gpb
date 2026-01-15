import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateStainingMethodDto {
    @ApiPropertyOptional({
        description: 'ID phương pháp nhuộm (BML_STAINING_METHOD.ID). Gửi null để xóa.',
        example: 'b8c2f0e4-1234-4d56-89ab-1c2d3e4f5a6b',
        nullable: true,
        maxLength: 36,
    })
    @IsOptional()
    @IsString()
    @MaxLength(36, { message: 'stainingMethodId không được dài quá 36 ký tự' })
    stainingMethodId?: string | null;
}
