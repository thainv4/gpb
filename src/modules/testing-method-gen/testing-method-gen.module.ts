import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestingMethodGen } from './entities/testing-method-gen.entity';
import { TestingMethodGenController } from './testing-method-gen.controller';
import { TestingMethodGenService } from './testing-method-gen.service';
import { TestingMethodGenRepository } from './repositories/testing-method-gen.repository';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([TestingMethodGen]),
        AuthModule,
    ],
    controllers: [TestingMethodGenController],
    providers: [
        TestingMethodGenService,
        CurrentUserContextService,
        {
            provide: 'ITestingMethodGenRepository',
            useClass: TestingMethodGenRepository,
        },
    ],
    exports: [TestingMethodGenService, 'ITestingMethodGenRepository'],
})
export class TestingMethodGenModule {}
