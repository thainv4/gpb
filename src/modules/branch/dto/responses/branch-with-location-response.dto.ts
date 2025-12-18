import { ApiProperty } from '@nestjs/swagger';
import { BranchResponseDto } from './branch-response.dto';

export class BranchWithLocationResponseDto extends BranchResponseDto {
    @ApiProperty({
        description: 'Thông tin tỉnh đầy đủ',
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

    @ApiProperty({
        description: 'Thông tin xã đầy đủ',
        example: {
            id: '550e8400-e29b-41d4-a716-446655440101',
            wardCode: '01001',
            wardName: 'Phường Phúc Xá',
            shortName: 'PX',
            provinceId: '550e8400-e29b-41d4-a716-446655440001',
            isActive: true,
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z'
        }
    })
    ward: {
        id: string;
        wardCode: string;
        wardName: string;
        shortName: string;
        provinceId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    };

    @ApiProperty({
        description: 'Địa chỉ đầy đủ với thông tin tỉnh và xã',
        example: '123 Đường ABC, Phường Phúc Xá, Hà Nội'
    })
    fullAddress: string;

    @ApiProperty({
        description: 'Thông tin vị trí địa lý',
        example: {
            province: 'Hà Nội',
            ward: 'Phường Phúc Xá',
            address: '123 Đường ABC',
            fullAddress: '123 Đường ABC, Phường Phúc Xá, Hà Nội'
        }
    })
    location: {
        province: string;
        ward: string;
        address: string;
        fullAddress: string;
    };
}
