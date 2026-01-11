import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsNumber, IsNotEmpty, IsOptional, ValidateIf, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateResultApiDataDto {
    @ApiPropertyOptional({ 
        description: 'Accession Number (optional - sẽ được tự động lấy từ HIS_SERE_SERV id thông qua query params tdlServiceReqCode và tdlServiceCode)', 
        example: '128611513' 
    })
    @IsOptional()
    @IsString()
    @ValidateIf((o, v) => v !== null && v !== undefined)
    AccessionNumber?: string;

    @ApiProperty({ description: 'Is Cancel', example: false })
    @IsBoolean()
    IsCancel: boolean;

    @ApiPropertyOptional({ description: 'Begin Time', example: null, nullable: true })
    @IsOptional()
    @ValidateIf((o, v) => v !== null)
    @IsNumber()
    BeginTime?: number | null;

    @ApiPropertyOptional({ description: 'End Time', example: 20260109140025, nullable: true })
    @IsOptional()
    @ValidateIf((o, v) => v !== null)
    @IsNumber()
    EndTime?: number | null;

    @ApiPropertyOptional({ description: 'Description', example: '', nullable: true })
    @IsOptional()
    @IsString()
    Description?: string;

    @ApiPropertyOptional({ description: 'Conclude', example: 'Test Kết quả chẩn đoán mô bệnh học', nullable: true })
    @IsOptional()
    @IsString()
    Conclude?: string;

    @ApiPropertyOptional({ description: 'Note', example: '', nullable: true })
    @IsOptional()
    @IsString()
    Note?: string;

    @ApiPropertyOptional({ description: 'Execute Loginname', example: 'thainv', nullable: true })
    @IsOptional()
    @IsString()
    ExecuteLoginname?: string;

    @ApiPropertyOptional({ description: 'Execute Username', example: 'Thái', nullable: true })
    @IsOptional()
    @IsString()
    ExecuteUsername?: string;

    @ApiPropertyOptional({ description: 'Technician Loginname', example: '', nullable: true })
    @IsOptional()
    @IsString()
    TechnicianLoginname?: string;

    @ApiPropertyOptional({ description: 'Technician Username', example: '', nullable: true })
    @IsOptional()
    @IsString()
    TechnicianUsername?: string;

    @ApiPropertyOptional({ description: 'Machine Code', example: '', nullable: true })
    @IsOptional()
    @IsString()
    MachineCode?: string;

    @ApiPropertyOptional({ description: 'Number Of Film', example: null, nullable: true })
    @IsOptional()
    @ValidateIf((o, v) => v !== null)
    @IsNumber()
    NumberOfFilm?: number | null;
}

export class UpdateResultDto {
    @ApiProperty({ description: 'API Data', type: UpdateResultApiDataDto })
    @IsObject()
    @ValidateNested()
    @Type(() => UpdateResultApiDataDto)
    ApiData: UpdateResultApiDataDto;
}
