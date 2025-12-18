import { ApiProperty } from '@nestjs/swagger';

export class CodeGenerationConfigDto {
    @ApiProperty({ description: 'Tiền tố mã tiếp nhận', example: 'BLOOD' })
    codePrefix: string;

    @ApiProperty({ description: 'Độ rộng phần số', example: 4 })
    codeWidth: number;

    @ApiProperty({ description: 'Cho phép mã trùng lặp', example: false })
    allowDuplicate: boolean;

    @ApiProperty({ description: 'Chu kỳ reset số thứ tự', example: 'MONTHLY' })
    resetPeriod: string;
}

export class GenerateCodeResponseDto {
    @ApiProperty({ description: 'Mã tiếp nhận được sinh', example: 'BLOOD202410.0001' })
    receptionCode: string;

    @ApiProperty({ description: 'Mã loại mẫu', example: 'BLOOD' })
    sampleTypeCode: string;

    @ApiProperty({ description: 'Ngày sinh mã', example: '202410' })
    date: string;

    @ApiProperty({ description: 'Số thứ tự tiếp theo', example: 1 })
    nextSequence: number;

    @ApiProperty({ description: 'Cấu hình sinh mã', type: CodeGenerationConfigDto })
    codeGenerationConfig: CodeGenerationConfigDto;
}
