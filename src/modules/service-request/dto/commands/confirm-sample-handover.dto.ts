import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class ConfirmSampleHandoverDto {
    @ApiProperty({ description: 'ID trạng thái đích' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    toStateId: string;

    @ApiProperty({ enum: ['COMPLETE'], default: 'COMPLETE' })
    @IsString()
    @IsIn(['COMPLETE'])
    actionType: 'COMPLETE';

    @ApiPropertyOptional()
    @IsOptional()
    @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    currentUserId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    currentDepartmentId?: string;

    @ApiPropertyOptional({ description: 'Phòng nhận bàn giao (LIS room id)' })
    @IsOptional()
    @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    currentRoomId?: string;

    @ApiPropertyOptional({ description: 'Ghi chú bàn giao' })
    @IsOptional()
    @IsString()
    handoverNote?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    flag?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    stainingMethodId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    barcodeGenGpb?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    resultConcludeGenGpb?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    sampleTypeNameGenGpb?: string;

    @ApiPropertyOptional({ description: 'Tên phòng nhận (hiển thị audit)' })
    @IsOptional()
    @IsString()
    receiverRoomName?: string;
}
