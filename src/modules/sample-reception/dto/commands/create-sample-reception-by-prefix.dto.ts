import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsIn, MinLength, MaxLength, Min, Max, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSampleReceptionByPrefixDto {
    @ApiProperty({ description: 'Tiền tố mã tiếp nhận', example: 'BLOOD' })
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(5)
    prefix: string;

    @ApiPropertyOptional({ description: 'ID loại mẫu (nếu có)', example: 'uuid-sample-type-001' })
    @IsOptional()
    @IsUUID('4', { message: 'Sample type ID phải là UUID hợp lệ' })
    sampleTypeId?: string;

    @ApiPropertyOptional({ description: 'Độ rộng phần số (1-5)', example: 4, default: 4 })
    @IsNumber()
    @IsOptional()
    @Min(1)
    @Max(5)
    codeWidth?: number;

    @ApiPropertyOptional({
        description: 'Chu kỳ reset số thứ tự',
        example: 'MONTHLY',
        enum: ['DAILY', 'MONTHLY', 'YEARLY', 'NEVER'],
        default: 'MONTHLY'
    })
    @IsString()
    @IsOptional()
    @IsIn(['DAILY', 'MONTHLY', 'YEARLY', 'NEVER'])
    resetPeriod?: 'DAILY' | 'MONTHLY' | 'YEARLY' | 'NEVER';

    @ApiPropertyOptional({ description: 'Cho phép mã trùng lặp', example: false, default: false })
    @IsBoolean()
    @IsOptional()
    allowDuplicate?: boolean;
}

