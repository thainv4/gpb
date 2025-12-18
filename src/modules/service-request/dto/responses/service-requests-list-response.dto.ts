import { ApiProperty } from '@nestjs/swagger';
import { ServiceRequestResponseDto } from './service-request-response.dto';

export interface GetServiceRequestsResult {
  serviceRequests: any[]; // Will be ServiceRequest[] from repository, ServiceRequestResponseDto[] from service
  total: number;
  limit: number;
  offset: number;
}

export class ServiceRequestsListResponseDto {
    @ApiProperty({ description: 'Danh sách yêu cầu dịch vụ', type: [ServiceRequestResponseDto] })
    serviceRequests: ServiceRequestResponseDto[];

    @ApiProperty({ description: 'Tổng số bản ghi', example: 100 })
    total: number;

    @ApiProperty({ description: 'Số lượng bản ghi', example: 10 })
    limit: number;

    @ApiProperty({ description: 'Vị trí bắt đầu', example: 0 })
    offset: number;

    @ApiProperty({ description: 'Có trang tiếp theo', example: true })
    hasNext: boolean;

    @ApiProperty({ description: 'Có trang trước', example: false })
    hasPrev: boolean;
}

export class ServiceRequestStatsDto {
    @ApiProperty({ description: 'Tổng số yêu cầu', example: 100 })
    total: number;

    @ApiProperty({ description: 'Số yêu cầu chờ xử lý', example: 25 })
    pending: number;

    @ApiProperty({ description: 'Số yêu cầu đã hoàn thành', example: 70 })
    completed: number;

    @ApiProperty({ description: 'Số yêu cầu đã hủy', example: 5 })
    cancelled: number;

    @ApiProperty({ description: 'Tổng giá trị', example: 15000000 })
    totalAmount: number;
}
