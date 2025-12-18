import { ApiProperty } from '@nestjs/swagger';
import { ServiceResponseDto } from './service-response.dto';
import { PaginationResponseDto } from '../../../../common/dto/pagination-response.dto';

export class GetServicesResult {
    @ApiProperty({ type: [ServiceResponseDto], description: 'Danh sách dịch vụ' })
    services: ServiceResponseDto[];

    @ApiProperty({ description: 'Tổng số bản ghi' })
    total: number;

    @ApiProperty({ description: 'Giới hạn mỗi trang' })
    limit: number;

    @ApiProperty({ description: 'Vị trí bắt đầu' })
    offset: number;
}

export class ServicesListResponseDto extends PaginationResponseDto<ServiceResponseDto> {
    @ApiProperty({ type: [ServiceResponseDto], description: 'Danh sách dịch vụ' })
    data: ServiceResponseDto[];
}
