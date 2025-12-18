import { ApiProperty } from '@nestjs/swagger';

export class PointSignResponseDto {
    @ApiProperty()
    CoorXRectangle: number;

    @ApiProperty()
    CoorYRectangle: number;

    @ApiProperty()
    PageNumber: number;

    @ApiProperty()
    MaxPageNumber: number;
}

export class OriginalVersionResponseDto {
    @ApiProperty()
    DocumentCode: string;

    @ApiProperty()
    Url: string;

    @ApiProperty()
    Base64Data: string;
}

export class SignResponseDto {
    @ApiProperty()
    DocumentCode: string;

    @ApiProperty()
    NumOrder: number;

    @ApiProperty()
    Loginname?: string;

    @ApiProperty()
    Username?: string;

    @ApiProperty()
    SignTime?: number | null;

    @ApiProperty()
    SignerId?: number;

    @ApiProperty()
    DepartmentCode?: string;

    @ApiProperty()
    DepartmentName?: string;

    @ApiProperty()
    Title?: string;

    @ApiProperty()
    PatientCode?: string;

    @ApiProperty()
    FirstName?: string;

    @ApiProperty()
    LastName?: string;

    @ApiProperty()
    FullName?: string;

    @ApiProperty()
    SerialNumber?: string;

    @ApiProperty()
    CardCode?: string;

    @ApiProperty()
    CmndNumber?: string;

    @ApiProperty()
    Version?: any;
}

export class CreateAndSignHsmResponseDto {
    @ApiProperty({ required: false })
    Description?: string;

    @ApiProperty({ type: PointSignResponseDto })
    PointSign: PointSignResponseDto;

    @ApiProperty()
    DocumentCode: string;

    @ApiProperty()
    DocumentName?: string;

    @ApiProperty()
    TreatmentCode: string;

    @ApiProperty()
    DocumentTypeId?: number | null;

    @ApiProperty()
    DocumentGroupId?: number | null;

    @ApiProperty()
    HisCode?: string;

    @ApiProperty({ type: OriginalVersionResponseDto })
    OriginalVersion: OriginalVersionResponseDto;

    @ApiProperty({ type: [SignResponseDto] })
    Signs: SignResponseDto[];
}

export class EmrApiResponseDto {
    @ApiProperty({ type: CreateAndSignHsmResponseDto })
    Data: CreateAndSignHsmResponseDto;

    @ApiProperty()
    Success: boolean;

    @ApiProperty()
    Param: {
        Messages: string[];
        BugCodes: string[];
        Start?: number | null;
        Limit?: number | null;
        Count?: number | null;
        ModuleCode?: string | null;
        LanguageCode?: string | null;
        HasException: boolean;
    };
}

