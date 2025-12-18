import { ApiProperty } from '@nestjs/swagger';

export class EmrSignerDataDto {
    @ApiProperty()
    ID: number;

    @ApiProperty()
    CREATE_TIME: number;

    @ApiProperty()
    MODIFY_TIME: number;

    @ApiProperty()
    CREATOR: string;

    @ApiProperty()
    MODIFIER: string;

    @ApiProperty()
    APP_CREATOR: string;

    @ApiProperty()
    APP_MODIFIER: string;

    @ApiProperty()
    IS_ACTIVE: number;

    @ApiProperty()
    IS_DELETE: number;

    @ApiProperty()
    GROUP_CODE: string;

    @ApiProperty()
    LOGINNAME: string;

    @ApiProperty()
    USERNAME: string;

    @ApiProperty()
    TITLE: string;

    @ApiProperty()
    DEPARTMENT_CODE: string;

    @ApiProperty()
    DEPARTMENT_NAME: string;

    @ApiProperty()
    NUM_ORDER: number;

    @ApiProperty()
    SIGN_IMAGE: string;

    @ApiProperty()
    PCA_SERIAL: string;

    @ApiProperty()
    CMND_NUMBER: string;

    @ApiProperty()
    EMAIL: string;

    @ApiProperty({ required: false, nullable: true })
    SCA_SERIAL?: string | null;

    @ApiProperty({ required: false, nullable: true })
    PHONE?: string | null;

    @ApiProperty()
    HSM_USER_CODE: string;

    @ApiProperty()
    SIGNATURE_DISPLAY_TYPE: number;

    @ApiProperty({ required: false, nullable: true })
    SIGNALTURE_IMAGE_WIDTH?: number | null;

    @ApiProperty({ required: false, nullable: true })
    PASSWORD?: string | null;

    @ApiProperty({ required: false, nullable: true })
    SECRET_KEY?: string | null;

    @ApiProperty({ type: [Object], required: false })
    EMR_SIGN_ORDER?: any[];

    @ApiProperty({ type: [Object], required: false })
    EMR_SIGNER_FLOW?: any[];

    @ApiProperty({ type: [Object], required: false })
    EMR_TREATMENT?: any[];
}

export class EmrSignerParamDto {
    @ApiProperty({ type: [String] })
    Messages: string[];

    @ApiProperty({ type: [String] })
    BugCodes: string[];

    @ApiProperty({ type: [String] })
    MessageCodes: string[];

    @ApiProperty()
    Start: number;

    @ApiProperty()
    Limit: number;

    @ApiProperty()
    Count: number;

    @ApiProperty({ required: false, nullable: true })
    ModuleCode?: string | null;

    @ApiProperty({ required: false, nullable: true })
    LanguageCode?: string | null;

    @ApiProperty()
    Now: number;

    @ApiProperty()
    HasException: boolean;
}

export class GetEmrSignerResponseDto {
    @ApiProperty({ type: [EmrSignerDataDto] })
    Data: EmrSignerDataDto[];

    @ApiProperty()
    Success: boolean;

    @ApiProperty({ type: EmrSignerParamDto })
    Param: EmrSignerParamDto;
}

