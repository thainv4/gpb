import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('BML_ROOM_GROUPS')
@Index('IDX_BML_RG_CODE', ['roomGroupCode'])
@Index('IDX_BML_RG_NAME', ['roomGroupName'])
@Index('IDX_BML_RG_ACTIVE', ['isActive'])
@Index('IDX_BML_RG_SORT', ['sortOrder'])
export class RoomGroup extends BaseEntity {

    @Column({ name: 'ROOM_GROUP_CODE', unique: true, length: 20 })
    roomGroupCode: string;

    @Column({ name: 'ROOM_GROUP_NAME', length: 100 })
    roomGroupName: string;

    @Column({ name: 'IS_ACTIVE', default: true })
    isActive: boolean;

    @Column({ name: 'SORT_ORDER', type: 'int', default: 0 })
    sortOrder: number;


    // Business methods
    getDisplayName(): string {
        return `${this.roomGroupCode} - ${this.roomGroupName}`;
    }

    getFullName(): string {
        return this.roomGroupName;
    }

    isRoomGroupActive(): boolean {
        return this.isActive && !this.deletedAt;
    }

    getShortDisplayName(): string {
        return this.roomGroupName;
    }

    // Validation methods
    validateRoomGroupCode(): boolean {
        return /^[A-Z0-9_]{2,20}$/.test(this.roomGroupCode);
    }

    validateRoomGroupName(): boolean {
        return this.roomGroupName && this.roomGroupName.trim().length >= 2;
    }

    // Helper methods
    toJSON() {
        return {
            id: this.id,
            roomGroupCode: this.roomGroupCode,
            roomGroupName: this.roomGroupName,
            isActive: this.isActive,
            sortOrder: this.sortOrder,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy,
            updatedBy: this.updatedBy,
            version: this.version,
        };
    }
}
