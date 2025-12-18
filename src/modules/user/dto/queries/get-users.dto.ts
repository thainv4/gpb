import { IsOptional, IsString, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetUsersDto {
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    @Transform(({ value }) => parseInt(value))
    limit?: number = 10;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Transform(({ value }) => parseInt(value))
    offset?: number = 0;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true')
    status?: boolean;
}
