import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteProvinceDto {
    @ApiProperty({
        description: 'ID của tỉnh cần xóa',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsString()
    @IsNotEmpty()
    id: string;

    @ApiProperty({
        description: 'Xóa cứng (hard delete) hay xóa mềm (soft delete)',
        example: false,
        default: false,
        required: false
    })
    @IsBoolean()
    @IsOptional()
    hardDelete?: boolean = false;
}
