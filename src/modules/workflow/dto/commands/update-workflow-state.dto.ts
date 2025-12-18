import { PartialType } from '@nestjs/swagger';
import { CreateWorkflowStateDto } from './create-workflow-state.dto';
import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWorkflowStateDto extends PartialType(CreateWorkflowStateDto) {
    @ApiPropertyOptional({ description: 'Mã trạng thái (không được thay đổi sau khi tạo)', example: 'SAMPLE_COLLECTION' })
    @IsOptional()
    stateCode?: string; // Optional nhưng nên không cho update
}

