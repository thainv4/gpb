import { ApiProperty } from '@nestjs/swagger';

export class DashboardStateDistributionItemDto {
    @ApiProperty()
    stateId: string;

    @ApiProperty()
    stateCode: string;

    @ApiProperty()
    stateName: string;

    @ApiProperty()
    stateOrder: number;

    @ApiProperty({ description: 'Số stored service request đang ở state này (theo quy tắc max STATE_ORDER / IS_CURRENT)' })
    count: number;
}

export class DashboardStateDistributionResponseDto {
    @ApiProperty({ nullable: true, description: 'Tham số fromDate đã gửi (nếu có)' })
    fromDate: string | null;

    @ApiProperty({ nullable: true, description: 'Tham số toDate đã gửi (nếu có)' })
    toDate: string | null;

    @ApiProperty({ nullable: true, description: 'Tham số currentRoomId đã gửi (nếu có)' })
    currentRoomId: string | null;

    @ApiProperty({ nullable: true, description: 'Tham số currentDepartmentId đã gửi (nếu có)' })
    currentDepartmentId: string | null;

    @ApiProperty({ type: [DashboardStateDistributionItemDto] })
    items: DashboardStateDistributionItemDto[];

    @ApiProperty({ description: 'Tổng số ca trong phân bổ (= tổng count các state)' })
    totalCases: number;
}
