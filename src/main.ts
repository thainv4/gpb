import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AppLoggerService } from './shared/services/logger.service';
import { TraceService } from './shared/services/trace.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        bodyParser: true,
        rawBody: true,
    });

    // Increase body size limit for PDF files (50MB)
    app.use(require('express').json({ limit: '50mb' }));
    app.use(require('express').urlencoded({ limit: '50mb', extended: true }));

    // Get services for dependency injection
    const loggerService = app.get(AppLoggerService);

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));

    // Global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter(loggerService));

    // Request context middleware - simplified
    const requestContextMiddleware = new RequestContextMiddleware();
    app.use(requestContextMiddleware.use.bind(requestContextMiddleware));

    // Global logging interceptor
    app.useGlobalInterceptors(new LoggingInterceptor(loggerService));

    // CORS configuration
    app.enableCors({
        origin: true, // Allow all origins for development
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Accept',
            'Origin',
            'X-Requested-With',
            'TokenCode',             // EMR token code header
            'ApplicationCode',       // HIS application code header
        ],
        credentials: true,
    });

    // Global prefix
    app.setGlobalPrefix(process.env.API_PREFIX || '/api/v1');

    // Setup Swagger documentation
    setupSwagger(app);

    const port = process.env.PORT || 8000;
    await app.listen(port);

    console.log(`🚀 LIS GPB Backend is running on: http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/v1/docs`);
}

bootstrap();
