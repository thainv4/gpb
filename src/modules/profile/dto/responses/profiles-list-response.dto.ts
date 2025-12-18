import { ApiProperty } from '@nestjs/swagger';
import { ProfileResponseDto } from './profile-response.dto';

export class GetProfilesResult {
    @ApiProperty({ type: [ProfileResponseDto], description: 'Danh sách profile' })
    profiles: ProfileResponseDto[];

    @ApiProperty({ description: 'Tổng số bản ghi', example: 100 })
    total: number;

    @ApiProperty({ description: 'Giới hạn mỗi trang', example: 10 })
    limit: number;

    @ApiProperty({ description: 'Vị trí bắt đầu', example: 0 })
    offset: number;
}
