import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Hl7OutQueueListItemDto {
    @ApiProperty({ description: 'ID bản ghi queue (hex 32 ký tự)' })
    id: string;

    @ApiProperty({ description: 'Mã tiếp nhận / LIS case', example: 'S2601.0312' })
    lisCaseId: string;

    @ApiPropertyOptional()
    slideId?: string | null;

    @ApiPropertyOptional()
    blockId?: string | null;

    @ApiPropertyOptional()
    testVantageCode?: string | null;

    @ApiPropertyOptional()
    testCode?: string | null;

    @ApiProperty({ description: 'Trạng thái queue (0 = chờ gửi)' })
    status: number;

    @ApiProperty()
    createdTime: Date;

    @ApiPropertyOptional()
    sentTime?: Date | null;

    @ApiPropertyOptional()
    errorMessage?: string | null;

    @ApiProperty()
    retryCount: number;
}
