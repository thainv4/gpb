import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class GetDepartmentTypeByIdDto {
    @ApiProperty({
        description: 'ID loại khoa',
        example: '550e8400-e29b-41d4-a716-446655440001',
    })
    @IsString()
    @IsNotEmpty()
    id: string;

    @ApiProperty({
        description: 'Bao gồm bản ghi đã xóa',
        example: false,
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    includeDeleted?: boolean;
}
