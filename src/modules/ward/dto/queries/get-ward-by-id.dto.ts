import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetWardByIdDto {
    @ApiProperty({
        description: 'ID của xã cần lấy thông tin',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsString()
    @IsNotEmpty()
    id: string;

    @ApiProperty({
        description: 'Bao gồm cả các bản ghi đã bị xóa mềm',
        example: false,
        default: false,
        required: false
    })
    @IsOptional()
    @IsBoolean()
    includeDeleted?: boolean = false;
}
