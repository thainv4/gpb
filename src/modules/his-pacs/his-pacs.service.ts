import { Injectable, Logger, BadRequestException, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { UpdateResultDto } from './dto/update-result.dto';
import { UpdateResultResponseDto } from './dto/update-result-response.dto';
import { HisSereServ } from '../service-request/entities/his-sere-serv.entity';

@Injectable()
export class HisPacsService {
    private readonly logger = new Logger(HisPacsService.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        @InjectRepository(HisSereServ, 'hisConnection')
        private readonly hisSereServRepo: Repository<HisSereServ>,
    ) { }

    async getHisSereServId(tdlServiceReqCode: string, tdlServiceCode: string): Promise<{ id: number; accessionNumber: string }> {
        const record = await this.hisSereServRepo.findOne({
            where: { 
                tdlServiceReqCode,
                tdlServiceCode,
            },
            select: ['id'],
        });

        if (!record) {
            throw new NotFoundException(
                `Không tìm thấy HIS_SERE_SERV với tdlServiceReqCode: ${tdlServiceReqCode} và tdlServiceCode: ${tdlServiceCode}`
            );
        }

        return {
            id: record.id,
            accessionNumber: record.id.toString(), // AccessionNumber là ID convert sang string
        };
    }

    async updateResult(
        updateResultDto: UpdateResultDto,
        tokenCode: string,
    ): Promise<UpdateResultResponseDto> {
        try {
            this.logger.log(`Calling HIS PACS UpdateResult API for AccessionNumber: ${updateResultDto.ApiData.AccessionNumber}`);

            // Get endpoint from config or use default
            const hisPacsEndpoint = this.configService.get<string>('HIS_PACS_ENDPOINT') || 'http://192.168.7.236:1608';
            const apiUrl = `${hisPacsEndpoint}/api/HisPacsServiceReq/UpdateResult`;

            // Get ApplicationCode from config or use default
            const applicationCode = this.configService.get<string>('HIS_APPLICATION_CODE') || 'HIS_RS';

            this.logger.debug(`HIS PACS API URL: ${apiUrl}`);
            this.logger.debug(`Request body: ${JSON.stringify(updateResultDto, null, 2)}`);

            const response = await firstValueFrom(
                this.httpService.post<UpdateResultResponseDto>(
                    apiUrl,
                    updateResultDto,
                    {
                        headers: {
                            'TokenCode': tokenCode,
                            'ApplicationCode': applicationCode,
                            'Content-Type': 'application/json',
                        },
                        timeout: 60000, // 60 seconds
                    }
                )
            );

            this.logger.log(`HIS PACS UpdateResult API call successful for AccessionNumber: ${updateResultDto.ApiData.AccessionNumber}`);
            
            return response.data;

        } catch (error: any) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            this.logger.error(
                `Failed to update result for AccessionNumber: ${updateResultDto.ApiData.AccessionNumber}`,
                errorMessage
            );

            if (error.response) {
                // API trả về error response
                const statusCode = error.response.status || HttpStatus.INTERNAL_SERVER_ERROR;
                const errorData = error.response.data || { message: errorMessage };
                
                this.logger.error(`HIS PACS API error response: ${JSON.stringify(errorData)}`);
                
                throw new HttpException(
                    {
                        message: errorData.ErrorMessage || errorData.message || 'HIS PACS API call failed',
                        errorCode: errorData.ErrorCode || 'HIS_PACS_API_ERROR',
                        statusCode,
                    },
                    statusCode
                );
            }

            throw new HttpException(
                {
                    message: `Failed to call HIS PACS API: ${errorMessage}`,
                    errorCode: 'HIS_PACS_API_ERROR',
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
