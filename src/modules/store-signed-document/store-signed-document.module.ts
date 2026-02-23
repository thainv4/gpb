import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoredSignedDocument } from './entities/stored-signed-document.entity';
import { StoredSignedDocumentController } from './store-signed-document.controller';
import { StoredSignedDocumentService } from './store-signed-document.service';
import { StoredSignedDocumentRepository } from './repositories/stored-signed-document.repository';
import { CurrentUserContextService } from '../../common/services/current-user-context.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([StoredSignedDocument]),
        AuthModule,
    ],
    controllers: [StoredSignedDocumentController],
    providers: [
        StoredSignedDocumentService,
        CurrentUserContextService,
        {
            provide: 'IStoredSignedDocumentRepository',
            useClass: StoredSignedDocumentRepository,
        },
    ],
    exports: [
        StoredSignedDocumentService,
        'IStoredSignedDocumentRepository',
    ],
})
export class StoreSignedDocumentModule {}
