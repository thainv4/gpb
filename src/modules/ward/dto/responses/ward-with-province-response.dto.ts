import { ApiProperty } from '@nestjs/swagger';
import { WardResponseDto } from './ward-response.dto';

export class WardWithProvinceResponseDto extends WardResponseDto {
    @ApiProperty({
        description: 'Thông tin chi tiết tỉnh',
        example: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            provinceCode: '01',
            provinceName: 'Hà Nội',
            shortName: 'HN',
            isActive: true,
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z'
        }
    })
    province: {
        id: string;
        provinceCode: string;
        provinceName: string;
        shortName: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    };
}
