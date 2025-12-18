import { IsNotEmpty, IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ReviewResultDto {
    @ApiProperty({ description: 'Phê duyệt hay từ chối', example: true })
    @IsNotEmpty({ message: 'Trạng thái phê duyệt là bắt buộc' })
    @Type(() => Boolean)
    @IsBoolean({ message: 'Trạng thái phê duyệt phải là boolean' })
    approved: boolean;

    @ApiPropertyOptional({ description: 'Ghi chú review', maxLength: 1000 })
    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: 'Ghi chú review không được quá 1000 ký tự' })
    notes?: string;
}

