import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateGpbFieldsDto {
    @ApiPropertyOptional({
        description: 'Barcode map gen GPB (BARCODE_MAP_GEN_GPB)',
        example: 'GPB-20251227001',
        maxLength: 50,
        nullable: true,
    })
    @IsOptional()
    @IsString()
    @MaxLength(50, { message: 'barcodeMapGenGpb không được quá 50 ký tự' })
    barcodeMapGenGpb?: string | null;

    @ApiPropertyOptional({
        description: 'Result conclude map gen GPB (RESULT_CONCLUDE_MAP_GEN_GPB)',
        example: 'Kết luận GPB',
        maxLength: 2000,
        nullable: true,
    })
    @IsOptional()
    @IsString()
    @MaxLength(2000, { message: 'resultConcludeMapGenGpb không được quá 2000 ký tự' })
    resultConcludeMapGenGpb?: string | null;
}
