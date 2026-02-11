import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateStoredServiceRequestDto {
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
