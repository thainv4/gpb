import { ApiProperty } from '@nestjs/swagger';
import { ResultTemplateResponseDto } from './result-template-response.dto';

export class ResultTemplatesListResponseDto {
    @ApiProperty({
        description: 'Danh sách mẫu kết quả',
        type: [ResultTemplateResponseDto]
    })
    data: ResultTemplateResponseDto[];

    @ApiProperty({
        description: 'Tổng số bản ghi',
        example: 100
    })
    total: number;

    @ApiProperty({
        description: 'Số lượng bản ghi trên mỗi trang',
        example: 10
    })
    limit: number;

    @ApiProperty({
        description: 'Số bản ghi bỏ qua',
        example: 0
    })
    offset: number;
}

