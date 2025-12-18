import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveResultDto {
    @ApiPropertyOptional({ description: 'Ghi chú phê duyệt', maxLength: 1000 })
    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: 'Ghi chú phê duyệt không được quá 1000 ký tự' })
    notes?: string;
}

