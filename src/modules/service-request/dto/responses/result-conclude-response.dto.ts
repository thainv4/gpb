import { ApiProperty } from '@nestjs/swagger';

export class ResultConcludeResponseDto {
    @ApiProperty({
        description: 'Kết luận (resultConclude) đầu tiên ứng với receptionCode',
        example: 'Bình thường',
        nullable: true,
    })
    resultConclude: string | null;

    @ApiProperty({
        description: 'Tên loại mẫu (sampleTypeName) đầu tiên ứng với receptionCode',
        example: 'Mẫu máu',
        nullable: true,
    })
    sampleTypeName: string | null;
}
