import { ApiProperty } from '@nestjs/swagger';

export class HisExecuteRoleResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'Bác sĩ xét nghiệm' })
    executeRoleName: string;
}
