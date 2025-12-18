import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetServiceByIdDto {
    @ApiProperty({
        description: 'ID của dịch vụ',
        example: 'service-uuid-here'
    })
    @IsUUID(4, { message: 'ID dịch vụ phải là UUID hợp lệ' })
    id: string;
}
