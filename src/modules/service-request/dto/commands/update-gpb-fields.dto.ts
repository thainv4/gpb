import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateGpbFieldsDto {
    @ApiPropertyOptional({
        description: 'Barcode gen GPB (BARCODE_GEN_GPB trên BML_STORED_SERVICE_REQUESTS)',
        example: 'GPB-20251227001',
        maxLength: 50,
        nullable: true,
    })
    @IsOptional()
    @IsString()
    @MaxLength(50, { message: 'barcodeGenGpb không được quá 50 ký tự' })
    barcodeGenGpb?: string | null;

    @ApiPropertyOptional({
        description: 'Result conclude gen GPB (RESULT_CONCLUDE_GEN_GPB)',
        example: 'Kết luận GPB',
        maxLength: 2000,
        nullable: true,
    })
    @IsOptional()
    @IsString()
    @MaxLength(2000, { message: 'resultConcludeGenGpb không được quá 2000 ký tự' })
    resultConcludeGenGpb?: string | null;

    @ApiPropertyOptional({
        description: 'Sample type name gen GPB (SAMPLE_TYPE_NAME_GEN_GPB)',
        example: 'GPB sample type',
        maxLength: 200,
        nullable: true,
    })
    @IsOptional()
    @IsString()
    @MaxLength(200, { message: 'sampleTypeNameGenGpb không được quá 200 ký tự' })
    sampleTypeNameGenGpb?: string | null;
}
