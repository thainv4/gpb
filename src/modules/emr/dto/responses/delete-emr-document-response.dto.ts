import { ApiProperty } from '@nestjs/swagger';

export class DeleteEmrDocumentResponseDto {
    @ApiProperty({ description: 'Response data from EMR API', required: false })
    Data?: any;

    @ApiProperty({ description: 'Response parameters', required: false })
    Param?: {
        Message?: string;
        Messages?: string[];
        HasException?: boolean;
    };
}

