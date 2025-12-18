import { Injectable, LogLevel } from '@nestjs/common';
import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface LogContext {
    traceId?: string;
    requestId?: string;
    userId?: string;
    method?: string;
    url?: string;
    ip?: string;
    userAgent?: string;
    duration?: number;
    statusCode?: number;
    errorCode?: string;
    [key: string]: any;
}

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: LogContext;
    stack?: string;
    service: string;
    version: string;
    environment: string;
}

@Injectable()
export class AppLoggerService {
    private readonly serviceName = 'lis-gpb-backend';
    private readonly version = process.env.npm_package_version || '1.0.0';
    private readonly environment = process.env.NODE_ENV || 'development';
    private readonly logDir = process.env.LOG_DIR || 'logs';
    private readonly maxFileSize = parseInt(process.env.LOG_MAX_FILE_SIZE || '10485760'); // 10MB
    private readonly maxFiles = parseInt(process.env.LOG_MAX_FILES || '5');

    constructor() {
        this.ensureLogDirectory();
    }

    private ensureLogDirectory(): void {
        if (!existsSync(this.logDir)) {
            mkdirSync(this.logDir, { recursive: true });
        }
    }

    private getLogFileName(level: LogLevel): string {
        const date = new Date().toISOString().split('T')[0];
        return join(this.logDir, `${this.serviceName}-${level}-${date}.log`);
    }

    private formatLogEntry(level: LogLevel, message: string, context?: LogContext, stack?: string): LogEntry {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            context,
            stack,
            service: this.serviceName,
            version: this.version,
            environment: this.environment,
        };
    }

    private writeToFile(level: LogLevel, logEntry: LogEntry): void {
        try {
            const fileName = this.getLogFileName(level);
            const logLine = JSON.stringify(logEntry) + '\n';

            // Check file size and rotate if necessary
            if (existsSync(fileName)) {
                const stats = require('fs').statSync(fileName);
                if (stats.size > this.maxFileSize) {
                    this.rotateLogFile(fileName);
                }
            }

            appendFileSync(fileName, logLine);
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }

    private rotateLogFile(fileName: string): void {
        try {
            const path = require('path');
            const dir = path.dirname(fileName);
            const ext = path.extname(fileName);
            const base = path.basename(fileName, ext);

            // Move existing files
            for (let i = this.maxFiles - 1; i > 0; i--) {
                const oldFile = path.join(dir, `${base}.${i}${ext}`);
                const newFile = path.join(dir, `${base}.${i + 1}${ext}`);
                if (existsSync(oldFile)) {
                    require('fs').renameSync(oldFile, newFile);
                }
            }

            // Move current file to .1
            const rotatedFile = path.join(dir, `${base}.1${ext}`);
            if (existsSync(fileName)) {
                require('fs').renameSync(fileName, rotatedFile);
            }
        } catch (error) {
            console.error('Failed to rotate log file:', error);
        }
    }

    private shouldLog(level: LogLevel): boolean {
        const logLevels: LogLevel[] = ['verbose', 'debug', 'log', 'warn', 'error'];
        const currentLevel = process.env.LOG_LEVEL as LogLevel || 'log';
        const currentIndex = logLevels.indexOf(currentLevel);
        const messageIndex = logLevels.indexOf(level);

        return messageIndex >= currentIndex;
    }

    log(message: string, context?: LogContext): void {
        if (!this.shouldLog('log')) return;

        const logEntry = this.formatLogEntry('log', message, context);
        console.log(JSON.stringify(logEntry));
        this.writeToFile('log', logEntry);
    }

    error(message: string, stack?: string, context?: LogContext): void {
        if (!this.shouldLog('error')) return;

        const logEntry = this.formatLogEntry('error', message, context, stack);
        console.error(JSON.stringify(logEntry));
        this.writeToFile('error', logEntry);
    }

    warn(message: string, context?: LogContext): void {
        if (!this.shouldLog('warn')) return;

        const logEntry = this.formatLogEntry('warn', message, context);
        console.warn(JSON.stringify(logEntry));
        this.writeToFile('warn', logEntry);
    }

    debug(message: string, context?: LogContext): void {
        if (!this.shouldLog('debug')) return;

        const logEntry = this.formatLogEntry('debug', message, context);
        console.debug(JSON.stringify(logEntry));
        this.writeToFile('debug', logEntry);
    }

    verbose(message: string, context?: LogContext): void {
        if (!this.shouldLog('verbose')) return;

        const logEntry = this.formatLogEntry('verbose', message, context);
        console.log(JSON.stringify(logEntry));
        this.writeToFile('verbose', logEntry);
    }

    // Business-specific logging methods
    logRequest(method: string, url: string, context: LogContext): void {
        this.log(`Request: ${method} ${url}`, {
            ...context,
            method,
            url,
            type: 'request',
        });
    }

    logResponse(method: string, url: string, statusCode: number, duration: number, context: LogContext): void {
        const level = statusCode >= 400 ? 'warn' : 'log';
        const message = `Response: ${method} ${url} - ${statusCode} (${duration}ms)`;

        if (level === 'warn') {
            this.warn(message, {
                ...context,
                method,
                url,
                statusCode,
                duration,
                type: 'response',
            });
        } else {
            this.log(message, {
                ...context,
                method,
                url,
                statusCode,
                duration,
                type: 'response',
            });
        }
    }

    logDatabaseQuery(query: string, duration: number, context: LogContext): void {
        this.debug(`Database Query: ${query}`, {
            ...context,
            query,
            duration,
            type: 'database',
        });
    }

    logBusinessEvent(event: string, data: any, context: LogContext): void {
        this.log(`Business Event: ${event}`, {
            ...context,
            event,
            data,
            type: 'business',
        });
    }

    logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context: LogContext): void {
        const level = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
        const message = `Security Event: ${event} (${severity})`;

        if (level === 'error') {
            this.error(message, undefined, {
                ...context,
                event,
                severity,
                type: 'security',
            });
        } else {
            this.warn(message, {
                ...context,
                event,
                severity,
                type: 'security',
            });
        }
    }

    logPerformance(operation: string, duration: number, context: LogContext): void {
        const level = duration > 5000 ? 'warn' : 'log'; // Warn if > 5 seconds
        const message = `Performance: ${operation} took ${duration}ms`;

        if (level === 'warn') {
            this.warn(message, {
                ...context,
                operation,
                duration,
                type: 'performance',
            });
        } else {
            this.log(message, {
                ...context,
                operation,
                duration,
                type: 'performance',
            });
        }
    }

    // Utility methods
    getLogFiles(): string[] {
        try {
            const fs = require('fs');
            const files = fs.readdirSync(this.logDir);
            return files.filter((file: string) => file.startsWith(this.serviceName));
        } catch (error) {
            return [];
        }
    }

    clearOldLogs(): void {
        try {
            const fs = require('fs');
            const path = require('path');
            const files = fs.readdirSync(this.logDir);
            const now = Date.now();
            const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

            files.forEach((file: string) => {
                if (file.startsWith(this.serviceName)) {
                    const filePath = path.join(this.logDir, file);
                    const stats = fs.statSync(filePath);
                    if (now - stats.mtime.getTime() > maxAge) {
                        fs.unlinkSync(filePath);
                    }
                }
            });
        } catch (error) {
            console.error('Failed to clear old logs:', error);
        }
    }
}
