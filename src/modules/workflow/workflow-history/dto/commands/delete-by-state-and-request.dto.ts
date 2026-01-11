import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class DeleteByStateAndRequestDto {
    @ApiProperty({ 
        description: 'ID của workflow state (toStateId)', 
        example: '426df256-bbfa-28d1-e065-9e6b783dd008' 
    })
    @IsString()
    @IsNotEmpty()
    toStateId: string;

    @ApiProperty({ 
        description: 'ID của stored service request', 
        example: 'abc-123-def-456' 
    })
    @IsString()
    @IsNotEmpty()
    storedServiceReqId: string;
}
