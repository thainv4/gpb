import { PivkaIiResultResponseDto } from './pivka-ii-result-response.dto';

export class PivkaIiResultsListResponseDto {
    items: PivkaIiResultResponseDto[];
    total: number;
    limit: number;
    offset: number;
}

