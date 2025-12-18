import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { HospitalLevel } from '../commands/create-branch.dto';

export enum WardBranchSortBy {
    BRANCH_NAME = 'branchName',
    BRANCH_CODE = 'branchCode',
    HOSPITAL_LEVEL = 'hospitalLevel',
    CREATED_AT = 'createdAt',
}

export enum WardBranchSortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class GetBranchesByWardDto {
    @ApiProperty({
        description: 'ID của xã',
        example: '550e8400-e29b-41d4-a716-446655440101'
    })
    @IsString()
    @IsNotEmpty()
    wardId: string;

    @ApiProperty({
        description: 'Số lượng bản ghi trả về',
        example: 10,
        minimum: 1,
        maximum: 100,
        default: 10,
        required: false
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiProperty({
        description: 'Vị trí bắt đầu (offset)',
        example: 0,
        minimum: 0,
        default: 0,
        required: false
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(0)
    offset?: number = 0;

    @ApiProperty({
        description: 'Trường để sắp xếp',
        enum: WardBranchSortBy,
        example: WardBranchSortBy.BRANCH_NAME,
        default: WardBranchSortBy.BRANCH_NAME,
        required: false
    })
    @IsOptional()
    @IsEnum(WardBranchSortBy)
    sortBy?: WardBranchSortBy = WardBranchSortBy.BRANCH_NAME;

    @ApiProperty({
        description: 'Thứ tự sắp xếp',
        enum: WardBranchSortOrder,
        example: WardBranchSortOrder.ASC,
        default: WardBranchSortOrder.ASC,
        required: false
    })
    @IsOptional()
    @IsEnum(WardBranchSortOrder)
    sortOrder?: WardBranchSortOrder = WardBranchSortOrder.ASC;

    @ApiProperty({
        description: 'Lọc theo trạng thái hoạt động',
        example: true,
        required: false
    })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({
        description: 'Lọc theo cấp bệnh viện',
        enum: HospitalLevel,
        example: HospitalLevel.TUYEN_1,
        required: false
    })
    @IsOptional()
    @IsEnum(HospitalLevel)
    hospitalLevel?: HospitalLevel;

    @ApiProperty({
        description: 'Tìm kiếm theo tên, mã, địa chỉ, đại diện',
        example: 'Chi nhánh Hà Nội',
        required: false
    })
    @IsOptional()
    @IsString()
    search?: string;
}
