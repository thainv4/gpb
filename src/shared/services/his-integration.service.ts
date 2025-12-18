import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface HisLoginResponse {
    Data: {
        ValidAddress: string;
        TokenCode: string;
        RenewCode: string;
        LoginTime: string;
        ExpireTime: string;
        LoginAddress: string;
        User: {
            LoginName: string;
            UserName: string;
            ApplicationCode: string;
            GCode: string;
            Email: string;
            Mobile: string;
        };
        VersionApp: string;
        MachineName: string;
        LastAccessTime: string;
        AuthorSystemCode: string | null;
        AuthenticationCode: string | null;
        RoleDatas: Array<{
            RoleCode: string;
            RoleName: string;
        }>;
    };
    Success: boolean;
    Param: any;
}

@Injectable()
export class HisIntegrationService {
    private readonly logger = new Logger(HisIntegrationService.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) { }

    async loginWithHis(mappedUsername: string, mappedPassword: string): Promise<HisLoginResponse> {
        try {
            this.logger.log(`Attempting HIS login for user: ${mappedUsername}`);

            const authString = `HIS:${mappedUsername}:${mappedPassword}`;
            const authBase64 = Buffer.from(authString).toString('base64');

            const hisLoginEndpoint = this.configService.get('HIS_ENDPOINT_LOGIN');

            const response = await firstValueFrom(
                this.httpService.get(
                    hisLoginEndpoint,
                    {
                        headers: {
                            'Authorization': `Basic ${authBase64}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 30000 // 30 seconds
                    }
                )
            );

            this.logger.log(`HIS login successful for user: ${mappedUsername}`);
            return response.data;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`HIS login failed for user: ${mappedUsername}`, errorMessage);
            throw new Error(`HIS integration failed: ${errorMessage}`);
        }
    }

    async renewHisToken(hisRenewCode: string): Promise<HisLoginResponse> {
        try {
            this.logger.log(`Attempting HIS token renewal`);

            const hisRenewEndpoint = this.configService.get('HIS_ENDPOINT_RENEW_TOKEN');

            const response = await firstValueFrom(
                this.httpService.post(
                    hisRenewEndpoint,
                    {}, // Empty body
                    {
                        headers: {
                            'RenewCode': hisRenewCode,
                            'Content-Type': 'application/json'
                        },
                        timeout: 30000
                    }
                )
            );

            this.logger.log(`HIS token renewal successful`);
            return response.data;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`HIS token renewal failed`, errorMessage);
            throw new Error(`HIS token renewal failed: ${errorMessage}`);
        }
    }

    async logoutFromHis(hisTokenCode: string): Promise<void> {
        try {
            this.logger.log(`Attempting HIS logout`);

            const hisLogoutEndpoint = this.configService.get('HIS_ENDPOINT_LOGOUT');

            await firstValueFrom(
                this.httpService.post(
                    hisLogoutEndpoint,
                    {}, // Empty body
                    {
                        headers: {
                            'TokenCode': hisTokenCode,
                            'Content-Type': 'application/json'
                        },
                        timeout: 30000
                    }
                )
            );

            this.logger.log(`HIS logout successful`);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`HIS logout failed`, errorMessage);
            throw new Error(`HIS logout failed: ${errorMessage}`);
        }
    }
}
