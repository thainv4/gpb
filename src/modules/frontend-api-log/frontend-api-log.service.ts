import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createLogger, format, transports, Logger } from 'winston';
import { CreateFrontendApiLogDto } from './dto/commands/create-frontend-api-log.dto';
import { CurrentUser } from '../../common/interfaces/current-user.interface';

@Injectable()
export class FrontendApiLogService {
    private readonly winstonLogger: Logger;

    constructor() {
        const logDir = process.env.LOG_DIR || 'logs';
        if (!existsSync(logDir)) {
            mkdirSync(logDir, { recursive: true });
        }

        this.winstonLogger = createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: format.combine(
                format.timestamp(),
                format.errors({ stack: true }),
                format.json(),
            ),
            defaultMeta: {
                service: 'lis-gpb-backend',
                component: 'frontend-api-log',
            },
            transports: [
                new transports.File({
                    filename: join(logDir, 'frontend-api.log'),
                    maxsize: parseInt(process.env.LOG_MAX_FILE_SIZE || '10485760', 10),
                    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10),
                }),
            ],
        });

        if (process.env.NODE_ENV !== 'production') {
            this.winstonLogger.add(
                new transports.Console({
                    format: format.combine(
                        format.colorize(),
                        format.simple(),
                    ),
                }),
            );
        }
    }

    logFrontendApiStatus(payload: CreateFrontendApiLogDto, currentUser: CurrentUser | null): void {
        const level = payload.status === 'error' ? 'error' : payload.statusCode && payload.statusCode >= 400 ? 'warn' : 'info';
        const message = `[frontend][${payload.screen}:${payload.action}] ${payload.step} -> ${payload.status}`;

        this.winstonLogger.log({
            level,
            message,
            traceId: payload.traceId,
            requestTimestamp: payload.timestamp,
            userId: currentUser?.id,
            username: currentUser?.username,
            ...payload,
        });
    }
}
