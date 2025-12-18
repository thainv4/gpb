import { IsString, IsNotEmpty, IsOptional, IsNumber, MinLength, MaxLength, Min, Max, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkflowStateDto {
    @ApiProperty({ description: 'Mã trạng thái (unique)', example: 'SAMPLE_COLLECTION' })
    @IsString()
    @IsNotEmpty({ message: 'Mã trạng thái là bắt buộc' })
    @MinLength(2, { message: 'Mã trạng thái phải có ít nhất 2 ký tự' })
    @MaxLength(50, { message: 'Mã trạng thái không được quá 50 ký tự' })
    stateCode: string;

    @ApiProperty({ description: 'Tên trạng thái', example: 'Lấy mẫu' })
    @IsString()
    @IsNotEmpty({ message: 'Tên trạng thái là bắt buộc' })
    @MinLength(2, { message: 'Tên trạng thái phải có ít nhất 2 ký tự' })
    @MaxLength(200, { message: 'Tên trạng thái không được quá 200 ký tự' })
    stateName: string;

    @ApiPropertyOptional({ description: 'Mô tả chi tiết trạng thái', example: 'Bước lấy mẫu từ bệnh nhân' })
    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: 'Mô tả không được quá 1000 ký tự' })
    stateDescription?: string;

    @ApiProperty({ description: 'Thứ tự trong workflow (1, 2, 3...)', example: 1 })
    @IsNumber({}, { message: 'Thứ tự phải là số' })
    @IsNotEmpty({ message: 'Thứ tự là bắt buộc' })
    @Min(1, { message: 'Thứ tự phải lớn hơn 0' })
    @Max(100, { message: 'Thứ tự không được quá 100' })
    stateOrder: number;

    @ApiPropertyOptional({ description: 'Có thể bỏ qua không (0 = không, 1 = có)', example: 0, default: 0 })
    @IsOptional()
    @IsNumber({}, { message: 'Can skip phải là số' })
    @IsIn([0, 1], { message: 'Can skip phải là 0 hoặc 1' })
    canSkip?: number = 0;

    @ApiPropertyOptional({ description: 'Cần phê duyệt không (0 = không, 1 = có)', example: 0, default: 0 })
    @IsOptional()
    @IsNumber({}, { message: 'Requires approval phải là số' })
    @IsIn([0, 1], { message: 'Requires approval phải là 0 hoặc 1' })
    requiresApproval?: number = 0;

    @ApiPropertyOptional({ description: 'Trạng thái active/inactive (0 = inactive, 1 = active)', example: 1, default: 1 })
    @IsOptional()
    @IsNumber({}, { message: 'Is active phải là số' })
    @IsIn([0, 1], { message: 'Is active phải là 0 hoặc 1' })
    isActive?: number = 1;
}

