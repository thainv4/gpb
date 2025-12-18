import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class DeleteDepartmentTypeDto {
    @ApiProperty({
        description: 'ID loại khoa',
        example: '550e8400-e29b-41d4-a716-446655440001',
    })
    @IsString()
    @IsNotEmpty()
    id: string;

    @ApiProperty({
        description: 'Xóa vĩnh viễn',
        example: false,
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    hardDelete?: boolean;
}
