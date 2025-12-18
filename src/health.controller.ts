import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResponseBuilder } from './common/builders/response.builder';

@ApiTags('Health')
@Controller()
export class HealthController {
    @Get('health')
    @ApiOperation({
        summary: 'Health check',
        description: 'Check the health status of the application'
    })
    @ApiResponse({
        status: 200,
        description: 'Application is healthy',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status_code: { type: 'number', example: 200 },
                data: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'healthy' },
                        timestamp: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
                        uptime: { type: 'number', example: 3600 },
                        environment: { type: 'string', example: 'development' }
                    }
                }
            }
        }
    })
    healthCheck() {
        return ResponseBuilder.success({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
        });
    }

    @Get('ready')
    readinessCheck() {
        return ResponseBuilder.success({
            status: 'ready',
            timestamp: new Date().toISOString(),
            services: {
                database: 'connected',
                redis: 'connected',
            },
        });
    }

    @Get()
    apiInfo() {
        return ResponseBuilder.success({
            name: 'LIS GPB Backend API',
            version: '1.0.0',
            description: 'Backend API for LIS GPB platform',
            endpoints: {
                auth: {
                    login: 'POST /api/v1/auth/login',
                    register: 'POST /api/v1/auth/register',
                },
                users: {
                    list: 'GET /api/v1/users',
                    get: 'GET /api/v1/users/:id',
                    create: 'POST /api/v1/users',
                    update: 'PUT /api/v1/users/:id',
                    delete: 'DELETE /api/v1/users/:id',
                    activate: 'PATCH /api/v1/users/:id/activate',
                },
                health: {
                    health: 'GET /api/v1/health',
                    ready: 'GET /api/v1/ready',
                },
            },
            documentation: 'http://localhost:3000/api/v1',
        });
    }
}
