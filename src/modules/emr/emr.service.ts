import { Injectable, Logger, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CreateAndSignHsmDto } from './dto/commands/create-and-sign-hsm.dto';
import { EmrApiResponseDto } from './dto/responses/create-and-sign-hsm-response.dto';
import { GetEmrSignerResponseDto } from './dto/responses/get-emr-signer-response.dto';
import { GetEmrSignerDto } from './dto/queries/get-emr-signer.dto';
import { ProfileService } from '../profile/profile.service';

@Injectable()
export class EmrService {
    private readonly logger = new Logger(EmrService.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly profileService: ProfileService,
    ) {}

    async createAndSignHsm(
        createAndSignHsmDto: CreateAndSignHsmDto,
        tokenCode: string,
        applicationCode: string,
    ): Promise<EmrApiResponseDto> {
        try {
            this.logger.log(`Calling EMR CreateAndSignHsm API for TreatmentCode: ${createAndSignHsmDto.TreatmentCode}`);

            const emrEndpoint = this.configService.get<string>('EMR_ENDPOINT_CREATE');
            if (!emrEndpoint) {
                throw new BadRequestException('EMR_ENDPOINT_CREATE is not configured');
            }

            const apiUrl = `${emrEndpoint}/api/EmrDocument/CreateAndSignHsm`;

            const requestBody = {
                ApiData: createAndSignHsmDto,
            };

            this.logger.debug(`EMR API URL: ${apiUrl}`);
            this.logger.debug(`Request body keys: ${Object.keys(requestBody.ApiData).join(', ')}`);
            if (createAndSignHsmDto.HisCode) {
                this.logger.debug(`HisCode: ${createAndSignHsmDto.HisCode}`);
            } else {
                this.logger.debug('HisCode: not provided');
            }

            const response = await firstValueFrom(
                this.httpService.post<EmrApiResponseDto>(
                    apiUrl,
                    requestBody,
                    {
                        headers: {
                            'TokenCode': tokenCode,
                            'ApplicationCode': applicationCode,
                            'Content-Type': 'application/json',
                        },
                        timeout: 120000, // 120 seconds for large document processing
                        maxContentLength: Infinity,
                        maxBodyLength: Infinity,
                    }
                )
            );

            this.logger.log(`EMR CreateAndSignHsm API call successful. DocumentCode: ${response.data.Data?.DocumentCode || 'N/A'}`);
            
            return response.data;

        } catch (error: any) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            this.logger.error(
                `Failed to create and sign document: ${createAndSignHsmDto.TreatmentCode || 'N/A'}`,
                errorMessage
            );

            if (error.response) {
                let status = error.response.status;
                const data = error.response.data;

                // Validate status code - ensure it's valid HTTP status
                if (!status || status < 100 || status > 599) {
                    this.logger.error(`Invalid status code from EMR API: ${status}, using 500`);
                    status = HttpStatus.INTERNAL_SERVER_ERROR;
                }

                this.logger.error(`EMR API Error - Status: ${status}`, JSON.stringify(data));

                // If EMR returns error response with structure, return it
                if (data && typeof data === 'object' && data.Data) {
                    return data as EmrApiResponseDto;
                }

                throw new HttpException(
                    {
                        message: 'EMR API request failed',
                        error: data?.Param?.Message || data?.Param?.Messages?.join(', ') || data?.message || errorMessage,
                        statusCode: status,
                    },
                    status
                );
            }

            throw new HttpException(
                {
                    message: 'Failed to communicate with EMR system',
                    error: errorMessage,
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getEmrSigner(
        userId: string | undefined,
        query: GetEmrSignerDto | undefined,
        tokenCode: string,
        applicationCode: string,
    ): Promise<GetEmrSignerResponseDto> {
        try {
            let loginName: string;

            // Nếu có loginname trong query, dùng nó. Nếu không, lấy từ profile
            if (query?.loginname) {
                loginName = query.loginname;
                this.logger.log(`Getting EMR signer with provided loginname: ${loginName}`);
            } else if (userId) {
                this.logger.log(`Getting EMR signer for user: ${userId}`);
                
                // Get user's profile to retrieve mappedUsername
                const profile = await this.profileService.getProfileByUserId(userId);

                if (!profile.mappedUsername) {
                    throw new BadRequestException('User does not have a mapped username configured in profile');
                }

                loginName = profile.mappedUsername;
                this.logger.debug(`Using mapped username from profile: ${loginName}`);
            } else {
                throw new BadRequestException('Either userId or loginname is required');
            }

            // Prepare the request data according to API specification
            const start = query?.Start ?? 0;
            const limit = query?.Limit ?? 10;

            const requestData = {
                ApiData: {
                    LOGINNAME__EXACT: loginName,
                    DEPARTMENT_CODE__EXACT: null,
                    ORDER_FIELD: null,
                    ORDER_DIRECTION: null,
                    ID: null,
                    IS_ACTIVE: 1,
                    CREATE_TIME_FROM: null,
                    CREATE_TIME_FROM__GREATER: null,
                    CREATE_TIME_TO: null,
                    CREATE_TIME_TO__LESS: null,
                    MODIFY_TIME_FROM: null,
                    MODIFY_TIME_FROM__GREATER: null,
                    MODIFY_TIME_TO: null,
                    MODIFY_TIME_TO__LESS: null,
                    CREATOR: null,
                    MODIFIER: null,
                    GROUP_CODE: null,
                    KEY_WORD: null,
                    IDs: null,
                },
                CommonParam: {
                    Messages: [],
                    BugCodes: [],
                    Start: start,
                    Limit: limit,
                    Count: null,
                    ModuleCode: null,
                    LanguageCode: null,
                    HasException: false,
                },
            };

            // Encode to base64
            const jsonString = JSON.stringify(requestData);
            const base64Encoded = Buffer.from(jsonString).toString('base64');

            this.logger.debug(`Base64 encoded data: ${base64Encoded.substring(0, 50)}...`);

            // Call the EMR API
            // Use EMR_ENDPOINT or default to the provided URL
            const emrEndpoint = this.configService.get<string>('EMR_ENDPOINT') || 'http://192.168.7.236:1415';
            const apiUrl = `${emrEndpoint}/api/EmrSigner/Get?param=${encodeURIComponent(base64Encoded)}`;
            
            this.logger.debug(`EMR API URL: ${apiUrl.substring(0, 100)}...`);

            const response = await firstValueFrom(
                this.httpService.get<GetEmrSignerResponseDto>(apiUrl, {
                    headers: {
                        'TokenCode': tokenCode,
                        'ApplicationCode': applicationCode,
                    },
                    timeout: 30000,
                })
            );

            this.logger.log(`EMR Signer API call successful. Found ${response.data.Data?.length || 0} signer(s)`);

            return response.data;

        } catch (error: any) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            this.logger.error(
                `Failed to get EMR signer for user: ${userId}`,
                errorMessage
            );

            if (error.response) {
                let status = error.response.status;
                const data = error.response.data;

                if (!status || status < 100 || status > 599) {
                    this.logger.error(`Invalid status code from EMR API: ${status}, using 500`);
                    status = HttpStatus.INTERNAL_SERVER_ERROR;
                }

                this.logger.error(`EMR API Error - Status: ${status}`, JSON.stringify(data));

                throw new HttpException(
                    {
                        message: 'EMR API request failed',
                        error: data?.Param?.Message || data?.Param?.Messages?.join(', ') || data?.message || errorMessage,
                        statusCode: status,
                    },
                    status
                );
            }

            // Re-throw BadRequestException (like missing mapped username)
            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new HttpException(
                {
                    message: 'Failed to communicate with EMR system',
                    error: errorMessage,
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}

