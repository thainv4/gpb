import { IsString, IsOptional, IsNumber, MinLength, MaxLength, IsBoolean, IsIn, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSampleTypeDto {
    @ApiPropertyOptional({ description: 'Mã loại mẫu', example: 'BLOOD' })
    @IsString()
    @IsOptional()
    @MinLength(2)
    @MaxLength(50)
    typeCode?: string;

    @ApiPropertyOptional({ description: 'Tên loại mẫu', example: 'Mẫu máu' })
    @IsString()
    @IsOptional()
    @MinLength(2)
    @MaxLength(200)
    typeName?: string;

    @ApiPropertyOptional({ description: 'Tên viết tắt', example: 'Máu' })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    shortName?: string;

    @ApiPropertyOptional({ description: 'Mô tả', example: 'Mẫu máu để xét nghiệm' })
    @IsString()
    @IsOptional()
    @MaxLength(2000)
    description?: string;

    @ApiPropertyOptional({ description: 'Số thứ tự', example: 1 })
    @IsNumber()
    @IsOptional()
    sortOrder?: number;

    @ApiPropertyOptional({ description: 'Tiền tố mã tiếp nhận (1-5 ký tự)', example: 'BLOOD' })
    @IsString()
    @IsOptional()
    @MinLength(1)
    @MaxLength(5)
    codePrefix?: string;

    @ApiPropertyOptional({ description: 'Độ rộng phần số (1-5)', example: 4 })
    @IsNumber()
    @IsOptional()
    @Min(1)
    @Max(5)
    codeWidth?: number;

    @ApiPropertyOptional({ description: 'Cho phép mã trùng lặp', example: false })
    @IsBoolean()
    @IsOptional()
    allowDuplicate?: boolean;

    @ApiPropertyOptional({
        description: 'Chu kỳ reset số thứ tự',
        example: 'MONTHLY',
        enum: ['DAILY', 'MONTHLY', 'YEARLY', 'NEVER']
    })
    @IsString()
    @IsOptional()
    @IsIn(['DAILY', 'MONTHLY', 'YEARLY', 'NEVER'])
    resetPeriod?: 'DAILY' | 'MONTHLY' | 'YEARLY' | 'NEVER';
}
