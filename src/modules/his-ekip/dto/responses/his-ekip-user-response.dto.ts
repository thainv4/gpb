import { ApiProperty } from '@nestjs/swagger';

export class HisEkipUserResponseDto {
    @ApiProperty({ example: 1001 })
    id: number;

    @ApiProperty({ example: 'Nguyễn Văn A', nullable: true })
    username: string | null;

    @ApiProperty({ example: 'nguyenvana' })
    loginname: string;
}
