import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsNumber, IsOptional, IsBoolean, Length, Min, Max } from 'class-validator';

export class CreateServiceDto {
    @ApiProperty({
        description: 'Mã dịch vụ',
        example: 'SVC001',
        minLength: 3,
        maxLength: 50
    })
    @IsString()
    @Length(3, 50, { message: 'Mã dịch vụ phải từ 3-50 ký tự' })
    serviceCode: string;

    @ApiProperty({
        description: 'Tên dịch vụ',
        example: 'Xét nghiệm máu tổng quát',
        minLength: 5,
        maxLength: 200
    })
    @IsString()
    @Length(5, 200, { message: 'Tên dịch vụ phải từ 5-200 ký tự' })
    serviceName: string;

    @ApiPropertyOptional({
        description: 'Tên viết tắt',
        example: 'XNMTQ',
        maxLength: 100
    })
    @IsString()
    @Length(2, 100, { message: 'Tên viết tắt phải từ 2-100 ký tự' })
    @IsOptional()
    shortName?: string;

    @ApiProperty({
        description: 'ID nhóm dịch vụ',
        example: 'group-uuid-here'
    })
    @IsUUID(4, { message: 'ID nhóm dịch vụ phải là UUID hợp lệ' })
    serviceGroupId: string;

    @ApiPropertyOptional({
        description: 'ID đơn vị tính',
        example: 'unit-uuid-here'
    })
    @IsUUID(4, { message: 'ID đơn vị tính phải là UUID hợp lệ' })
    @IsOptional()
    unitOfMeasureId?: string;

    @ApiPropertyOptional({
        description: 'Mapping JSON cho tích hợp hệ thống khác',
        example: '{"his_code": "HIS001", "external_id": "EXT001"}'
    })
    @IsString()
    @IsOptional()
    mapping?: string;

    @ApiPropertyOptional({
        description: 'Thứ tự sắp xếp',
        example: 1,
        minimum: 0,
        maximum: 9999
    })
    @IsNumber({}, { message: 'Thứ tự sắp xếp phải là số' })
    @Min(0, { message: 'Thứ tự sắp xếp phải lớn hơn hoặc bằng 0' })
    @Max(9999, { message: 'Thứ tự sắp xếp không được vượt quá 9999' })
    @IsOptional()
    numOrder?: number;

    @ApiPropertyOptional({
        description: 'Giá hiện tại',
        example: 150000,
        minimum: 0
    })
    @IsNumber({}, { message: 'Giá hiện tại phải là số' })
    @Min(0, { message: 'Giá hiện tại phải lớn hơn hoặc bằng 0' })
    @IsOptional()
    currentPrice?: number;

    @ApiPropertyOptional({
        description: 'ID dịch vụ cha (để tạo dịch vụ con)',
        example: 'parent-service-uuid-here'
    })
    @IsUUID(4, { message: 'ID dịch vụ cha phải là UUID hợp lệ' })
    @IsOptional()
    parentServiceId?: string;

    @ApiPropertyOptional({
        description: 'Mô tả chi tiết dịch vụ',
        example: 'Xét nghiệm máu tổng quát bao gồm các chỉ số cơ bản'
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        description: 'Trạng thái hoạt động',
        example: true,
        default: true
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
