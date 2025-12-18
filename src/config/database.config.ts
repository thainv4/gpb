import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { OracleNamingStrategy } from './oracle-naming.strategy';

// Oracle Database Configuration
export const databaseConfig: TypeOrmModuleOptions = {
    type: 'oracle',
    host: process.env.DB_HOST || '192.168.7.248',
    port: parseInt(process.env.DB_PORT) || 1521,
    username: process.env.DB_USERNAME || 'LIS_RS',
    password: process.env.DB_PASSWORD || 'LIS_RS',
    serviceName: process.env.DB_SERVICE_NAME || 'orclstb',
    entities: [__dirname + '/../modules/**/entities/*.entity{.ts,.js}'],
    synchronize: false, // Disable synchronize for Oracle
    logging: process.env.NODE_ENV === 'development',
    namingStrategy: new OracleNamingStrategy(),
    migrations: ['dist/migrations/*.js'],
    migrationsRun: true,
    extra: {
        connectString: `${process.env.DB_HOST || '192.168.7.248'}:${process.env.DB_PORT || 1521}/${process.env.DB_SERVICE_NAME || 'orclstb'}`,
        poolMin: 2,
        poolMax: 10,
        poolIncrement: 1,
        poolTimeout: 60,
        poolPingInterval: 60,
    },
};
