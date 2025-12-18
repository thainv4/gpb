import { ApiProperty } from '@nestjs/swagger';
import { ServiceGroupResponseDto } from './service-group-response.dto';

export interface GetServiceGroupsResult {
    serviceGroups: ServiceGroupResponseDto[];
    total: number;
    limit: number;
    offset: number;
}

export class ServiceGroupsListResponseDto {
    @ApiProperty({ description: 'Danh sách nhóm dịch vụ', type: [ServiceGroupResponseDto] })
    serviceGroups: ServiceGroupResponseDto[];

    @ApiProperty({ description: 'Tổng số bản ghi' })
    total: number;

    @ApiProperty({ description: 'Số bản ghi trên mỗi trang' })
    limit: number;

    @ApiProperty({ description: 'Số bản ghi bỏ qua' })
    offset: number;
}
