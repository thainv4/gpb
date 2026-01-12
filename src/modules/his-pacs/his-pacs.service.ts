import { Injectable, Logger, BadRequestException, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { UpdateResultDto } from './dto/update-result.dto';
import { UpdateResultResponseDto } from './dto/update-result-response.dto';
import { StartDto } from './dto/start.dto';
import { StartResponseDto, StartResponseArrayDto } from './dto/start-response.dto';
import { HisSereServ } from '../service-request/entities/his-sere-serv.entity';
import { HisSereServService } from '../his-sere-serv/his-sere-serv.service';

@Injectable()
export class HisPacsService {
    private readonly logger = new Logger(HisPacsService.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        @InjectRepository(HisSereServ, 'hisConnection')
        private readonly hisSereServRepo: Repository<HisSereServ>,
        private readonly hisSereServService: HisSereServService,
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

    async start(
        tdlServiceReqCode: string,
        tokenCode: string,
    ): Promise<StartResponseArrayDto> {
        try {
            // Lấy tất cả dữ liệu từ API his-sere-serv (không có tdlServiceCode)
            const hisSereServResults = await this.hisSereServService.getHisSereServId({
                tdlServiceReqCode,
                // tdlServiceCode không được truyền vào
            });

            if (!hisSereServResults || hisSereServResults.length === 0) {
                throw new NotFoundException(
                    `Không tìm thấy HIS_SERE_SERV với tdlServiceReqCode: ${tdlServiceReqCode}`
                );
            }

            this.logger.log(`Found ${hisSereServResults.length} HIS_SERE_SERV records. Calling Start API for each.`);

            // Get endpoint from config or use default
            const hisPacsEndpoint = this.configService.get<string>('HIS_PACS_START_ENDPOINT') || 'http://192.168.7.200:1420';
            const apiUrl = `${hisPacsEndpoint}/api/HisPacsServiceReq/Start`;

            // Get ApplicationCode from config or use default
            const applicationCode = this.configService.get<string>('HIS_APPLICATION_CODE') || 'HIS_RS';

            const results: StartResponseDto[] = [];
            let successCount = 0;
            let errorCount = 0;

            // Gọi API Start cho mỗi accessionNumber
            for (const hisSereServResult of hisSereServResults) {
                const accessionNumber = hisSereServResult.accessionNumber;

                try {
                    this.logger.log(`Calling HIS PACS Start API for AccessionNumber: ${accessionNumber}`);

                    const requestBody: StartDto = {
                        ApiData: accessionNumber,
                    };

                    this.logger.debug(`HIS PACS Start API URL: ${apiUrl}`);
                    this.logger.debug(`Request body: ${JSON.stringify(requestBody, null, 2)}`);

                    const response = await firstValueFrom(
                        this.httpService.post<StartResponseDto>(
                            apiUrl,
                            requestBody,
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

                    this.logger.log(`HIS PACS Start API call successful for AccessionNumber: ${accessionNumber}`);
                    
                    // Thêm AccessionNumber vào response để dễ theo dõi
                    const result: StartResponseDto = {
                        ...response.data,
                        AccessionNumber: accessionNumber,
                    };
                    results.push(result);
                    successCount++;

                } catch (error: any) {
                    errorCount++;
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    
                    this.logger.error(
                        `Failed to call HIS PACS Start API for AccessionNumber: ${accessionNumber}`,
                        errorMessage
                    );

                    // Tạo error response object
                    const errorResponse: StartResponseDto = {
                        Success: false,
                        AccessionNumber: accessionNumber,
                        ErrorMessage: error.response?.data?.ErrorMessage || error.response?.data?.message || errorMessage,
                        ErrorCode: error.response?.data?.ErrorCode || 'HIS_PACS_START_API_ERROR',
                    };

                    results.push(errorResponse);
                }
            }

            return {
                results,
                successCount,
                errorCount,
                totalCount: hisSereServResults.length,
            };

        } catch (error: any) {
            // Re-throw NotFoundException
            if (error instanceof NotFoundException) {
                throw error;
            }

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            this.logger.error(
                `Failed to process HIS PACS Start API`,
                errorMessage
            );

            throw new HttpException(
                {
                    message: `Failed to process HIS PACS Start API: ${errorMessage}`,
                    errorCode: 'HIS_PACS_START_API_ERROR',
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async unstart(
        tdlServiceReqCode: string,
        tokenCode: string,
    ): Promise<StartResponseArrayDto> {
        try {
            // Lấy tất cả dữ liệu từ API his-sere-serv (không có tdlServiceCode)
            const hisSereServResults = await this.hisSereServService.getHisSereServId({
                tdlServiceReqCode,
                // tdlServiceCode không được truyền vào
            });

            if (!hisSereServResults || hisSereServResults.length === 0) {
                throw new NotFoundException(
                    `Không tìm thấy HIS_SERE_SERV với tdlServiceReqCode: ${tdlServiceReqCode}`
                );
            }

            this.logger.log(`Found ${hisSereServResults.length} HIS_SERE_SERV records. Calling Unstart API for each.`);

            // Get endpoint from config or use default
            const hisPacsEndpoint = this.configService.get<string>('HIS_PACS_UNSTART_ENDPOINT') || 'http://192.168.7.200:1420';
            const apiUrl = `${hisPacsEndpoint}/api/HisPacsServiceReq/Unstart`;

            // Get ApplicationCode from config or use default
            const applicationCode = this.configService.get<string>('HIS_APPLICATION_CODE') || 'HIS_RS';

            const results: StartResponseDto[] = [];
            let successCount = 0;
            let errorCount = 0;

            // Gọi API Unstart cho mỗi accessionNumber
            for (const hisSereServResult of hisSereServResults) {
                const accessionNumber = hisSereServResult.accessionNumber;

                try {
                    this.logger.log(`Calling HIS PACS Unstart API for AccessionNumber: ${accessionNumber}`);

                    const requestBody: StartDto = {
                        ApiData: accessionNumber,
                    };

                    this.logger.debug(`HIS PACS Unstart API URL: ${apiUrl}`);
                    this.logger.debug(`Request body: ${JSON.stringify(requestBody, null, 2)}`);

                    const response = await firstValueFrom(
                        this.httpService.post<StartResponseDto>(
                            apiUrl,
                            requestBody,
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

                    this.logger.log(`HIS PACS Unstart API call successful for AccessionNumber: ${accessionNumber}`);
                    
                    // Thêm AccessionNumber vào response để dễ theo dõi
                    const result: StartResponseDto = {
                        ...response.data,
                        AccessionNumber: accessionNumber,
                    };
                    results.push(result);
                    successCount++;

                } catch (error: any) {
                    errorCount++;
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    
                    this.logger.error(
                        `Failed to call HIS PACS Unstart API for AccessionNumber: ${accessionNumber}`,
                        errorMessage
                    );

                    // Tạo error response object
                    const errorResponse: StartResponseDto = {
                        Success: false,
                        AccessionNumber: accessionNumber,
                        ErrorMessage: error.response?.data?.ErrorMessage || error.response?.data?.message || errorMessage,
                        ErrorCode: error.response?.data?.ErrorCode || 'HIS_PACS_UNSTART_API_ERROR',
                    };

                    results.push(errorResponse);
                }
            }

            return {
                results,
                successCount,
                errorCount,
                totalCount: hisSereServResults.length,
            };

        } catch (error: any) {
            // Re-throw NotFoundException
            if (error instanceof NotFoundException) {
                throw error;
            }

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            this.logger.error(
                `Failed to process HIS PACS Unstart API`,
                errorMessage
            );

            throw new HttpException(
                {
                    message: `Failed to process HIS PACS Unstart API: ${errorMessage}`,
                    errorCode: 'HIS_PACS_UNSTART_API_ERROR',
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
