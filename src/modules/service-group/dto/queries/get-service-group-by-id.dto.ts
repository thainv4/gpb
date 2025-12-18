import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetServiceGroupByIdDto {
    @ApiProperty({ description: 'ID của nhóm dịch vụ' })
    @IsString()
    @IsNotEmpty()
    id: string;
}
