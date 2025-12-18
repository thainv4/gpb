import { ApiProperty } from '@nestjs/swagger';
import { ServiceResponseDto } from './service-response.dto';

export class ServiceWithChildrenResponseDto extends ServiceResponseDto {
    @ApiProperty({
        type: [ServiceResponseDto],
        description: 'Danh sách dịch vụ con'
    })
    subServices: ServiceResponseDto[];
}
