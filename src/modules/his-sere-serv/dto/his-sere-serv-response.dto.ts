import { ApiProperty } from '@nestjs/swagger';

export class HisSereServResponseDto {
    @ApiProperty({ description: 'ID', example: 123456 })
    id: number;

    @ApiProperty({ description: 'Accession Number', example: '128611513' })
    accessionNumber: string;
}
