import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsString, Matches } from 'class-validator';

export class CancelDeviceOutboundBatchDto {
    @ApiProperty({
        description: 'Danh sách ID queue (32 ký tự hex)',
        example: ['A1B2C3D4E5F6789012345678ABCDEF01'],
        type: [String],
    })
    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    @Matches(/^[0-9a-fA-F]{32}$/, { each: true, message: 'Each id must be 32 hex characters' })
    ids: string[];
}
