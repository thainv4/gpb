import { PrimaryColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, VersionColumn, Column, BeforeInsert } from 'typeorm';
import { randomUUID } from 'crypto';

export abstract class BaseEntity {
    @PrimaryColumn({ name: 'ID', type: 'varchar2', length: 36 })
    id: string;

    @CreateDateColumn({ name: 'CREATED_AT' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'UPDATED_AT' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'DELETED_AT', nullable: true })
    deletedAt?: Date;

    @Column({ name: 'CREATED_BY', nullable: true })
    createdBy?: string;

    @Column({ name: 'UPDATED_BY', nullable: true })
    updatedBy?: string;

    @VersionColumn({ name: 'VERSION' })
    version: number;

    @BeforeInsert()
    generateId() {
        if (!this.id) {
            this.id = randomUUID();
        }
    }
}
