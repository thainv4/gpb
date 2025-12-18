import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UnitOfMeasureResponseDto {
    @ApiProperty({ description: 'ID', example: 'uuid' })
    id: string;

    @ApiProperty({ description: 'Mã đơn vị tính', example: 'UOM_PC' })
    unitOfMeasureCode: string;

    @ApiProperty({ description: 'Tên đơn vị tính', example: 'Phần trăm' })
    unitOfMeasureName: string;

    @ApiPropertyOptional({ description: 'Mô tả', example: 'Đơn vị phần trăm' })
    description?: string;

    @ApiPropertyOptional({ description: 'Mapping JSON', example: '{"hisCode":"PC"}' })
    mapping?: string | null;
}

export interface GetUnitsOfMeasureResult {
    items: UnitOfMeasureResponseDto[];
    total: number;
    limit: number;
    offset: number;
}


