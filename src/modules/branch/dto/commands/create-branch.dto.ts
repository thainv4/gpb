import { IsString, IsNotEmpty, IsOptional, IsBoolean, MinLength, MaxLength, Matches, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum HospitalLevel {
    TUYEN_1 = 'Tuyến 1',
    TUYEN_2 = 'Tuyến 2',
    TUYEN_3 = 'Tuyến 3',
    TUYEN_4 = 'Tuyến 4',
}

export class CreateBranchDto {
    @ApiProperty({
        description: 'Mã chi nhánh (tự động tạo nếu không cung cấp)',
        example: 'HN001',
        minLength: 5,
        maxLength: 10,
        pattern: '^[A-Z]{2,3}[0-9]{3}$',
        required: false
    })
    @IsString()
    @IsOptional()
    @MinLength(5)
    @MaxLength(10)
    @Matches(/^[A-Z]{2,3}[0-9]{3}$/, { message: 'Mã chi nhánh phải có định dạng: 2-3 chữ cái + 3 chữ số (VD: HN001, HCM001)' })
    branchCode?: string;

    @ApiProperty({
        description: 'Tên chi nhánh',
        example: 'Chi nhánh Hà Nội',
        minLength: 2,
        maxLength: 200
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(200)
    branchName: string;

    @ApiProperty({
        description: 'Tên viết tắt của chi nhánh',
        example: 'CN HN',
        minLength: 2,
        maxLength: 50
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    shortName: string;

    @ApiProperty({
        description: 'ID của tỉnh',
        example: '550e8400-e29b-41d4-a716-446655440001',
        format: 'uuid'
    })
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    provinceId: string;

    @ApiProperty({
        description: 'ID của xã',
        example: '550e8400-e29b-41d4-a716-446655440101',
        format: 'uuid'
    })
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    wardId: string;

    @ApiProperty({
        description: 'Địa chỉ chi tiết',
        example: '123 Đường ABC, Phường XYZ',
        minLength: 10,
        maxLength: 500
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(500)
    address: string;

    @ApiProperty({
        description: 'Số điện thoại',
        example: '0123456789',
        minLength: 10,
        maxLength: 15,
        pattern: '^(\+84|84|0)[1-9][0-9]{8,9}$'
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(15)
    @Matches(/^(\+84|84|0)[1-9][0-9]{8,9}$/, { message: 'Số điện thoại không hợp lệ' })
    phoneNumber: string;

    @ApiProperty({
        description: 'Cấp bệnh viện',
        enum: HospitalLevel,
        example: HospitalLevel.TUYEN_1
    })
    @IsString()
    @IsNotEmpty()
    @IsEnum(HospitalLevel)
    hospitalLevel: HospitalLevel;

    @ApiProperty({
        description: 'Người đại diện',
        example: 'Nguyễn Văn A',
        minLength: 2,
        maxLength: 100
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    representative: string;

    @ApiProperty({
        description: 'Mã BHYT',
        example: '1234567890',
        minLength: 10,
        maxLength: 15,
        pattern: '^[0-9]{10,15}$'
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(15)
    @Matches(/^[0-9]{10,15}$/, { message: 'Mã BHYT phải là 10-15 chữ số' })
    bhyCode: string;

    @ApiProperty({
        description: 'Trạng thái hoạt động',
        example: true,
        default: true,
        required: false
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean = true;
}
