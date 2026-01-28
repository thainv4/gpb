import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnterResultDto } from '../commands/enter-result.dto';
import { ResultRequestDto } from './result-request.dto';

export class GetResultResponseDto extends EnterResultDto {
    @ApiPropertyOptional({
        description: 'Ghi chú kết quả',
        example: 'Ghi chú về kết quả xét nghiệm',
        nullable: true,
    })
    resultNotes?: string | null;

    @ApiProperty({
        description: 'Thông tin yêu cầu xét nghiệm',
        type: ResultRequestDto,
    })
    request: ResultRequestDto;
}
