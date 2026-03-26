export class PivkaIiResultResponseDto {
    id: string;

    storedSrServicesId: string;

    pivkaIiResult?: string | null;
    afpFullResult?: string | null;
    afpL3?: string | null;

    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    createdBy?: string | null;
    updatedBy?: string | null;
    version: number;
}

