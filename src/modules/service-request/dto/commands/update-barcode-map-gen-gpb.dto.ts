import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateBarcodeMapGenGpbDto {
    @ApiPropertyOptional({
        description: 'Giá trị barcode map gen GPB (cột BARCODE_MAP_GEN_GPB bảng BML_STORED_SR_SERVICES)',
        example: 'GPB-20251227001',
        maxLength: 50,
        nullable: true,
    })
    @IsOptional()
    @IsString()
    @MaxLength(50, { message: 'barcodeMapGenGpb không được quá 50 ký tự' })
    barcodeMapGenGpb?: string | null;
}
