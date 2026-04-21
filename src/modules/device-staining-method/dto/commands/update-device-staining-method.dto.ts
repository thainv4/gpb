import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class UpdateDeviceStainingMethodDto {
    @ApiPropertyOptional({ description: 'Tên phương pháp nhuộm (thiết bị)', example: 'Gram Stain' })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    methodName?: string;

    @ApiPropertyOptional({ description: 'Số/ký hiệu protocol trên thiết bị (không được rỗng nếu gửi lên)', example: 'P-HE-01' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @ValidateIf((_, v) => v !== undefined)
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    protocolNo?: string;
}
