import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getHisDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
    return {
        name: 'hisConnection', // Connection name for HIS database
        type: 'oracle',
        host: configService.get<string>('DB_HOST_HIS', '192.168.7.248'),
        port: configService.get<number>('DB_PORT_HIS', 1521),
        username: configService.get<string>('DB_USERNAME_HIS', 'HIS_RS'),
        password: configService.get<string>('DB_PASSWORD_HIS', 'HIS_RS'),
        serviceName: configService.get<string>('DB_SERVICE_NAME_HIS', 'orclstb'),
        entities: [
            'dist/modules/service-request/entities/service-request-view.entity.js',
        ],
        synchronize: false, // Never synchronize with HIS database
        logging: configService.get<string>('NODE_ENV') === 'development',
        extra: {
            connectString: `${configService.get<string>('DB_HOST_HIS')}:${configService.get<number>('DB_PORT_HIS')}/${configService.get<string>('DB_SERVICE_NAME_HIS')}`,
            poolMin: 2,
            poolMax: 10,
            poolIncrement: 1,
            poolTimeout: 60,
            poolPingInterval: 60,
        },
    };
};
