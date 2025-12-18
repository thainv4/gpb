import { Injectable, Inject } from '@nestjs/common';
import { DataSource, EntityTarget, Repository } from 'typeorm';
import { CurrentUserContextService } from './current-user-context.service';

@Injectable()
export abstract class BaseService {
    constructor(
        protected readonly dataSource: DataSource,
        @Inject(CurrentUserContextService)
        protected readonly currentUserContext: CurrentUserContextService,
    ) { }

    /**
     * Save entity with automatic audit fields
     */
    protected async saveWithAudit<T>(
        entity: T,
        entityClass: EntityTarget<T>,
        isUpdate: boolean = false
    ): Promise<T> {
        const currentUser = this.currentUserContext.getCurrentUser();

        if (currentUser) {
            // Set audit fields based on operation type
            if (isUpdate) {
                (entity as any).updatedBy = currentUser.id;
            } else {
                (entity as any).createdBy = currentUser.id;
                (entity as any).updatedBy = currentUser.id;
            }
        }

        return this.dataSource.manager.save(entityClass, entity);
    }

    /**
     * Transaction with automatic audit fields
     */
    protected async transactionWithAudit<T>(
        runInTransaction: (manager: any) => Promise<T>
    ): Promise<T> {
        return this.dataSource.transaction(async (manager) => {
            // Set current user context for the transaction
            const currentUser = this.currentUserContext.getCurrentUser();

            return runInTransaction(manager);
        });
    }

    /**
     * Set audit fields on entity
     */
    protected setAuditFields(entity: any, isUpdate: boolean = false): void {
        const currentUser = this.currentUserContext.getCurrentUser();

        if (currentUser) {
            if (isUpdate) {
                entity.updatedBy = currentUser.id;
            } else {
                entity.createdBy = currentUser.id;
                entity.updatedBy = currentUser.id;
            }
        }
    }
}
