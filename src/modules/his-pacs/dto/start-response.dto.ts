import { ApiProperty } from '@nestjs/swagger';

export class StartResponseDto {
    @ApiProperty({ description: 'Success', example: true })
    Success: boolean;

    @ApiProperty({ description: 'Message', example: 'Success' })
    Message?: string;

    @ApiProperty({ description: 'Data', required: false })
    Data?: any;

    @ApiProperty({ description: 'Error Message', required: false })
    ErrorMessage?: string;

    @ApiProperty({ description: 'Error Code', required: false })
    ErrorCode?: string;

    @ApiProperty({ description: 'Accession Number', required: false })
    AccessionNumber?: string;
}

export class StartResponseArrayDto {
    @ApiProperty({ description: 'Kết quả các lần gọi API Start', type: [StartResponseDto] })
    results: StartResponseDto[];

    @ApiProperty({ description: 'Số lượng thành công', example: 2 })
    successCount: number;

    @ApiProperty({ description: 'Số lượng thất bại', example: 0 })
    errorCount: number;

    @ApiProperty({ description: 'Tổng số lượng', example: 2 })
    totalCount: number;
}
