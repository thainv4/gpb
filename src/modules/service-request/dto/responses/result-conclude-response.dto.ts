import { ApiProperty } from '@nestjs/swagger';

export class ResultConcludeResponseDto {
    @ApiProperty({
        description: 'Kết luận (resultConclude) đầu tiên ứng với receptionCode',
        example: 'Bình thường',
        nullable: true,
    })
    resultConclude: string | null;
}
