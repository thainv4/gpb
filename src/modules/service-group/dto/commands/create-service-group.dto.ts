import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, Length, Matches, IsJSON, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceGroupDto {
    @ApiProperty({ description: 'Mã nhóm dịch vụ', example: 'LAB' })
    @IsString()
    @IsNotEmpty()
    @Length(2, 20)
    @Matches(/^[A-Z0-9_]+$/, { message: 'Mã nhóm dịch vụ chỉ được chứa chữ hoa, số và dấu gạch dưới' })
    serviceGroupCode: string;

    @ApiProperty({ description: 'Tên nhóm dịch vụ', example: 'Xét nghiệm' })
    @IsString()
    @IsNotEmpty()
    @Length(2, 100)
    serviceGroupName: string;

    @ApiPropertyOptional({ description: 'Tên viết tắt', example: 'XN' })
    @IsString()
    @IsOptional()
    @Length(1, 50)
    shortName?: string;

    @ApiPropertyOptional({ description: 'Mapping với hệ thống khác', example: '{"HIS": "LAB_GROUP", "LIS": "LABORATORY"}' })
    @IsString()
    @IsOptional()
    @Length(1, 2000)
    @IsJSON()
    mapping?: string;

    @ApiPropertyOptional({ description: 'Mô tả chi tiết', example: 'Nhóm dịch vụ xét nghiệm cơ bản và chuyên sâu' })
    @IsString()
    @IsOptional()
    @Length(1, 2000)
    description?: string;

    @ApiPropertyOptional({ description: 'Icon cho UI', example: 'lab-icon' })
    @IsString()
    @IsOptional()
    @Length(1, 100)
    icon?: string;

    @ApiPropertyOptional({ description: 'Màu sắc cho UI (hex)', example: '#FF5722' })
    @IsString()
    @IsOptional()
    @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Màu sắc phải là mã hex hợp lệ' })
    color?: string;

    @ApiPropertyOptional({ description: 'Trạng thái hoạt động', example: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', example: 1 })
    @IsNumber()
    @IsOptional()
    @Min(0)
    sortOrder?: number;
}
