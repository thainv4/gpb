import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFlagDto {
    @ApiPropertyOptional({ 
        description: 'Giá trị flag mới cho stored service request. Có thể null để xóa flag.',
        example: 'URGENT',
        nullable: true,
        maxLength: 50
    })
    @IsOptional()
    @IsString()
    @MaxLength(50, { message: 'Flag không được quá 50 ký tự' })
    flag?: string | null;
}
