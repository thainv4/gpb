import { ApiProperty } from '@nestjs/swagger';
import { TestingMethodGenResponseDto } from './testing-method-gen-response.dto';

export class TestingMethodsGenListResponseDto {
    @ApiProperty({ description: 'Danh sách phương pháp xét nghiệm', type: [TestingMethodGenResponseDto] })
    testingMethodsGen: TestingMethodGenResponseDto[];

    @ApiProperty({ description: 'Tổng số bản ghi' })
    total: number;

    @ApiProperty({ description: 'Số lượng mỗi trang' })
    limit: number;

    @ApiProperty({ description: 'Vị trí bắt đầu' })
    offset: number;
}
