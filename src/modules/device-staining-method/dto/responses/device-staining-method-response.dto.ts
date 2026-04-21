import { ApiProperty } from '@nestjs/swagger';

export class DeviceStainingMethodResponseDto {
    @ApiProperty({ description: 'ID phương pháp nhuộm (thiết bị)' })
    id: string;

    @ApiProperty({ description: 'Tên phương pháp nhuộm' })
    methodName: string;

    @ApiProperty({ description: 'Ngày tạo' })
    createdAt: Date;

    @ApiProperty({ description: 'Ngày cập nhật' })
    updatedAt: Date;

    @ApiProperty({ description: 'Người tạo', nullable: true })
    createdBy?: string | null;

    @ApiProperty({ description: 'Người cập nhật', nullable: true })
    updatedBy?: string | null;

    @ApiProperty({ description: 'Phiên bản' })
    version: number;
}
