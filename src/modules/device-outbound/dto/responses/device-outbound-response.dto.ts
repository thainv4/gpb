import { ApiProperty } from '@nestjs/swagger';

export class DeviceOutboundResponseDto {
    @ApiProperty({ description: 'ID bản ghi' })
    id: string;

    @ApiProperty({ description: 'Mã tiếp nhận mẫu' })
    receptionCode: string;

    @ApiProperty({ description: 'Mã dịch vụ' })
    serviceCode: string;

    @ApiProperty({ description: 'Block ID (receptionCode + A + blockNumber)' })
    blockId: string;

    @ApiProperty({ description: 'Slide ID (receptionCode + A + blockNumber.slideNumber)' })
    slideId: string;

    @ApiProperty({ description: 'Phương pháp' })
    method: string;

    @ApiProperty({ description: 'Thời điểm tạo' })
    createdAt: Date;

    @ApiProperty({ description: 'Thời điểm cập nhật' })
    updatedAt: Date;
}
