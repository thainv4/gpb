import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateResultResponseDto {
    @ApiProperty({ description: 'Success status' })
    Success: boolean;

    @ApiProperty({ description: 'Response data', required: false })
    Data?: any;

    @ApiProperty({ description: 'Error message', required: false })
    ErrorMessage?: string;

    @ApiProperty({ description: 'Error code', required: false })
    ErrorCode?: string;

    @ApiPropertyOptional({ description: 'HIS SERE SERV ID (nếu có query params)', example: 123456, required: false })
    hisSereServId?: number;
}
