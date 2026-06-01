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
import { StoredServiceRequest } from '../service-request/entities/stored-service-request.entity';
import { HisSereServService } from '../his-sere-serv/his-sere-serv.service';
import { AppLoggerService, LogContext } from '../../shared/services/logger.service';
import { ServiceRequestAuditLogService } from '../service-request-audit-log/services/service-request-audit-log.service';

interface TestIndicationSaveLogContext {
    userId?: string;
    traceId?: string;
    requestId?: string;
}

interface TestIndicationStoreSnapshot {
    found: boolean;
    success: boolean;
    storedId?: string;
    serviceReqCode?: string;
    storedAt?: string;
}

interface TestIndicationHisPacsStartSnapshot {
    status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
    outcome: 'success' | 'partial_fail' | 'fail';
    successCount: number;
    errorCount: number;
    totalCount: number;
    durationMs: number;
    results: StartResponseDto[];
    errorCode?: string;
    errorMessage?: string;
}

@Injectable()
export class HisPacsService {
    private readonly logger = new Logger(HisPacsService.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        @InjectRepository(HisSereServ, 'hisConnection')
        private readonly hisSereServRepo: Repository<HisSereServ>,
        @InjectRepository(StoredServiceRequest)
        private readonly storedServiceReqRepo: Repository<StoredServiceRequest>,
        private readonly hisSereServService: HisSereServService,
        private readonly appLogger: AppLoggerService,
        private readonly auditLogService: ServiceRequestAuditLogService,
    ) { }

    private isStartItemSuccess(result: StartResponseDto): boolean {
        const hasException = (result as any)?.Param?.HasException === true;
        return result?.Success === true && (result as any)?.Data === true && !hasException;
    }

    private async buildStoreSnapshot(tdlServiceReqCode: string): Promise<TestIndicationStoreSnapshot> {
        const storedReq = await this.storedServiceReqRepo.findOne({
            where: { hisServiceReqCode: tdlServiceReqCode },
            order: { createdAt: 'DESC' },
            select: ['id', 'serviceReqCode', 'createdAt'],
        });

        if (!storedReq) {
            return { found: false, success: false };
        }

        return {
            found: true,
            success: true,
            storedId: storedReq.id,
            serviceReqCode: storedReq.serviceReqCode,
            storedAt: storedReq.createdAt?.toISOString(),
        };
    }

    private logTestIndicationSave(
        tdlServiceReqCode: string,
        store: TestIndicationStoreSnapshot,
        hisPacsStart: TestIndicationHisPacsStartSnapshot,
        logContext?: TestIndicationSaveLogContext,
    ): void {
        const context: LogContext = {
            type: 'business',
            event: 'test_indication_save',
            serviceReqCode: tdlServiceReqCode,
            userId: logContext?.userId,
            traceId: logContext?.traceId,
            requestId: logContext?.requestId,
        };

        this.appLogger.logBusinessEvent(
            'test_indication_save',
            {
                serviceReqCode: tdlServiceReqCode,
                store,
                hisPacsStart,
            },
            context,
        );
    }

    private async mergeTicketStoredStartStatus(
        tdlServiceReqCode: string,
        input: {
            status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
            successCount: number;
            errorCount: number;
            totalCount: number;
            message: string;
        },
    ): Promise<void> {
        const storedReq = await this.storedServiceReqRepo.findOne({
            where: { hisServiceReqCode: tdlServiceReqCode },
            order: { createdAt: 'DESC' },
            select: ['id'],
        });
        if (!storedReq) {
            return;
        }

        await this.auditLogService.mergeLatestTicketStoredSnapshot(storedReq.id, {
            hisServiceReqCode: tdlServiceReqCode,
            hisPacsStartStatus: input.status,
            hisPacsStartSuccessCount: input.successCount,
            hisPacsStartErrorCount: input.errorCount,
            hisPacsStartTotalCount: input.totalCount,
            hisPacsStartMessage: input.message,
            hisPacsStartUpdatedAt: new Date().toISOString(),
        });
    }

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
        logContext?: TestIndicationSaveLogContext,
    ): Promise<StartResponseArrayDto> {
        const startedAt = Date.now();
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
                    const itemSuccess = this.isStartItemSuccess(result);
                    if (itemSuccess) {
                        successCount++;
                    } else {
                        errorCount++;
                    }

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

            const totalCount = hisSereServResults.length;
            const computedSuccessCount = results.filter((item) => this.isStartItemSuccess(item)).length;
            const computedErrorCount = totalCount - computedSuccessCount;
            const durationMs = Date.now() - startedAt;
            const outcome = computedErrorCount === 0
                ? 'success'
                : computedSuccessCount > 0
                    ? 'partial_fail'
                    : 'fail';

            const startStatus: 'SUCCESS' | 'FAILED' | 'PARTIAL' =
                computedErrorCount === 0 ? 'SUCCESS' : computedSuccessCount > 0 ? 'PARTIAL' : 'FAILED';
            await this.mergeTicketStoredStartStatus(tdlServiceReqCode, {
                status: startStatus,
                successCount: computedSuccessCount,
                errorCount: computedErrorCount,
                totalCount,
                message: `Start HIS-PACS ${startStatus}: ${computedSuccessCount}/${totalCount} thành công, ${computedErrorCount}/${totalCount} thất bại`,
            });

            const storeSnapshot = await this.buildStoreSnapshot(tdlServiceReqCode);
            this.logTestIndicationSave(
                tdlServiceReqCode,
                storeSnapshot,
                {
                    status: startStatus,
                    outcome,
                    successCount: computedSuccessCount,
                    errorCount: computedErrorCount,
                    totalCount,
                    durationMs,
                    results,
                },
                logContext,
            );

            return {
                results,
                successCount,
                errorCount,
                totalCount,
            };

        } catch (error: any) {
            const durationMs = Date.now() - startedAt;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const storeSnapshot = await this.buildStoreSnapshot(tdlServiceReqCode);
            const hisPacsStartSnapshot: TestIndicationHisPacsStartSnapshot = {
                status: 'FAILED',
                outcome: 'fail',
                successCount: 0,
                errorCount: 0,
                totalCount: 0,
                durationMs,
                results: [],
                errorCode: error instanceof NotFoundException ? 'HIS_SERE_SERV_NOT_FOUND' : 'HIS_PACS_START_API_ERROR',
                errorMessage,
            };

            this.logTestIndicationSave(
                tdlServiceReqCode,
                storeSnapshot,
                hisPacsStartSnapshot,
                logContext,
            );

            if (error instanceof NotFoundException) {
                throw error;
            }

            this.logger.error(
                `Failed to process HIS PACS Start API`,
                errorMessage
            );

            await this.mergeTicketStoredStartStatus(tdlServiceReqCode, {
                status: 'FAILED',
                successCount: 0,
                errorCount: 0,
                totalCount: 0,
                message: `Start HIS-PACS FAILED: ${errorMessage}`,
            });

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
