import { ApiProperty } from '@nestjs/swagger';
import { ServiceResponseDto } from './service-response.dto';

export class ServiceHierarchyResponseDto extends ServiceResponseDto {
    @ApiProperty({
        type: [ServiceHierarchyResponseDto],
        description: 'Cây phân cấp dịch vụ con'
    })
    children: ServiceHierarchyResponseDto[];
}
