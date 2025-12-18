import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class PointSignDto {
    @ApiProperty({ description: 'Tọa độ X của vị trí ký trên trang ký', example: 0.0 })
    @IsNotEmpty()
    @IsNumber()
    CoorXRectangle: number;

    @ApiProperty({ description: 'Tọa độ Y của vị trí ký trên trang ký', example: 0.0 })
    @IsNotEmpty()
    @IsNumber()
    CoorYRectangle: number;

    @ApiProperty({ description: 'Trang chứa vị trí ký', example: 1 })
    @IsNotEmpty()
    @IsNumber()
    PageNumber: number;

    @ApiProperty({ description: 'Tổng số trang của văn bản', example: 2 })
    @IsNotEmpty()
    @IsNumber()
    MaxPageNumber: number;

    @ApiProperty({ description: 'Độ rộng chữ ký', required: false })
    @IsOptional()
    @IsNumber()
    WidthRectangle?: number;

    @ApiProperty({ description: 'Độ cao chữ ký', required: false })
    @IsOptional()
    @IsNumber()
    HeightRectangle?: number;

    @ApiProperty({ description: 'Tỷ lệ hiển thị ảnh ký vs chữ ký', example: 0 })
    @IsNotEmpty()
    @IsNumber()
    TextPosition: number;

    @ApiProperty({
        description: 'Cấu hình hiển thị: 1=Chỉ thông tin ký, 2=Chỉ ảnh ký, 3=Không hiển thị, 4=Cả hai',
        example: 2
    })
    @IsNotEmpty()
    @IsNumber()
    TypeDisplay: number;

    @ApiProperty({ description: 'Kích thước font', required: false })
    @IsOptional()
    @IsNumber()
    SizeFont?: number;

    @ApiProperty({ description: 'Cấu hình hiển thị người ký, thời gian ký, địa điểm ký', required: false })
    @IsOptional()
    @IsString()
    FormatRectangleText?: string;
}

export class OriginalVersionDto {
    @ApiProperty({ description: 'Dữ liệu base64 của văn bản PDF', example: 'JVBERi0xLjQKJeLjz9MKMy...' })
    @IsNotEmpty()
    @IsString()
    Base64Data: string;

    @ApiProperty({ description: 'Link của văn bản sau khi tạo thành công', required: false })
    @IsOptional()
    @IsString()
    Url?: string;
}

export class SignDto {
    @ApiProperty({ description: 'Tài khoản ký', required: false, example: 'dunglh' })
    @IsOptional()
    @IsString()
    Loginname?: string;

    @ApiProperty({ description: 'Họ tên tài khoản ký', required: false, example: 'Lê Hữu Dũng' })
    @IsOptional()
    @IsString()
    Username?: string;

    @ApiProperty({ description: 'ID của người ký (từ bảng EMR_SIGNER)', required: false, example: 123 })
    @IsOptional()
    @IsNumber()
    SignerId?: number;

    @ApiProperty({ description: 'SerialNumber Chứng Thư Số', required: false })
    @IsOptional()
    @IsString()
    SerialNumber?: string;

    @ApiProperty({ description: 'Số thứ tự ký', example: 1 })
    @IsNotEmpty()
    @IsNumber()
    NumOrder: number;

    @ApiProperty({ description: 'Mã bệnh nhân', required: false })
    @IsOptional()
    @IsString()
    PatientCode?: string;

    @ApiProperty({ description: 'Tên bệnh nhân', required: false })
    @IsOptional()
    @IsString()
    FirstName?: string;

    @ApiProperty({ description: 'Họ bệnh nhân', required: false })
    @IsOptional()
    @IsString()
    LastName?: string;

    @ApiProperty({ description: 'Số thẻ KCB', required: false })
    @IsOptional()
    @IsString()
    CardCode?: string;

    @ApiProperty({ description: 'Số CMND', required: false })
    @IsOptional()
    @IsString()
    CmndNumber?: string;
}

export class CreateAndSignHsmDto {
    @ApiProperty({ description: 'Mô tả văn bản', required: false })
    @IsOptional()
    @IsString()
    Description?: string;

    @ApiProperty({ description: 'Vị trí ký văn bản và các thông tin ký', type: PointSignDto })
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => PointSignDto)
    PointSign: PointSignDto;

    @ApiProperty({ description: 'Tên văn bản', required: false })
    @IsOptional()
    @IsString()
    DocumentName?: string;

    @ApiProperty({ description: 'Mã hồ sơ bệnh án', example: 'Mã hồ sơ bệnh án' })
    @IsNotEmpty()
    @IsString()
    TreatmentCode: string;

    @ApiProperty({ description: 'ID loại văn bản (từ bảng EMR_DOCUMENT_TYPE)', required: false })
    @IsOptional()
    @IsNumber()
    DocumentTypeId?: number;

    @ApiProperty({ description: 'ID nhóm văn bản (từ bảng EMR_DOCUMENT_GROUP)', required: false })
    @IsOptional()
    @IsNumber()
    DocumentGroupId?: number;

    @ApiProperty({ description: 'Mã định danh văn bản của HIS', required: false })
    @IsOptional()
    @IsString()
    HisCode?: string;

    @ApiProperty({ description: 'Thông tin file thực hiện ký', type: OriginalVersionDto })
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => OriginalVersionDto)
    OriginalVersion: OriginalVersionDto;

    @ApiProperty({ description: 'Thiết lập thứ tự ký cho văn bản', type: [SignDto] })
    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SignDto)
    Signs: SignDto[];

    @ApiProperty({
        description: 'Kiểu dữ liệu của file văn bản ký: 0=PDF (mặc định), 1=XML, 2=JSON',
        required: false,
        example: 0
    })
    @IsOptional()
    @IsNumber()
    FileType?: number;
}

