import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateNumOfBlockDto {
    @ApiPropertyOptional({
        description: 'Số lượng block (text). Gửi null để xóa.',
        example: '5',
        nullable: true,
        maxLength: 50,
    })
    @IsOptional()
    @IsString({ message: 'numOfBlock phải là chuỗi ký tự' })
    @MaxLength(50, { message: 'numOfBlock không được quá 50 ký tự' })
    numOfBlock?: string | null;
}
