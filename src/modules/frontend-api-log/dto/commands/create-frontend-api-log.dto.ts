import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateFrontendApiLogDto {
    @ApiProperty({ example: 'trace-1744301335000', description: 'Trace ID từ frontend' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(128)
    traceId: string;

    @ApiProperty({ example: 'test-indications' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    screen: string;

    @ApiProperty({ example: 'save' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    action: string;

    @ApiProperty({
        example: 'store-service-request',
        enum: ['create-reception', 'store-service-request', 'update-reception-code', 'start-his-pacs'],
    })
    @IsString()
    @IsNotEmpty()
    @IsIn(['create-reception', 'store-service-request', 'update-reception-code', 'start-his-pacs'])
    step: string;

    @ApiProperty({ example: 'success', enum: ['start', 'success', 'error'] })
    @IsString()
    @IsNotEmpty()
    @IsIn(['start', 'success', 'error'])
    status: string;

    @ApiPropertyOptional({ example: 201, description: 'HTTP status code của API liên quan' })
    @IsOptional()
    @IsInt()
    @Min(0)
    statusCode?: number;

    @ApiPropertyOptional({ example: 'POST' })
    @IsOptional()
    @IsString()
    @MaxLength(10)
    method?: string;

    @ApiPropertyOptional({ example: '/service-requests/store' })
    @IsOptional()
    @IsString()
    @MaxLength(300)
    endpoint?: string;

    @ApiPropertyOptional({ example: '000055537395' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    serviceReqCode?: string;

    @ApiPropertyOptional({ example: '426df256-bbfe-28d1-e065-9e6b783dd008' })
    @IsOptional()
    @IsString()
    @MaxLength(128)
    storedServiceReqId?: string;

    @ApiPropertyOptional({ example: 'T202604.0001' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    receptionCode?: string;

    @ApiPropertyOptional({ example: '426df256-bbfe-28d1-e065-9e6b783dd008' })
    @IsOptional()
    @IsString()
    @MaxLength(128)
    serviceId?: string;

    @ApiPropertyOptional({ example: 'Network error' })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    error?: string;

    @ApiProperty({ example: '2026-04-10T09:22:15.450Z' })
    @IsString()
    @IsNotEmpty()
    timestamp: string;
}
