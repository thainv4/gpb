import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchSampleTypesDto {
    @ApiProperty({ description: 'Từ khóa tìm kiếm', example: 'máu' })
    @IsString()
    @IsNotEmpty()
    q: string;
}
