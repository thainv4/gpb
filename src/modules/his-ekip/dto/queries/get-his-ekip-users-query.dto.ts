import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class GetHisEkipUsersQueryDto {
    @ApiProperty({ description: 'ID khoa/phòng (HIS_DEPARTMENT)', example: 45, required: true })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    departmentId: number;

    @ApiProperty({ description: 'ID vai trò thực hiện (HIS_EXECUTE_ROLE)', example: 1, required: true })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    executeRoleId: number;
}
