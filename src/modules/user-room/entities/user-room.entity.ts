import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Room } from '../../room/entities/room.entity';

@Entity('BML_USER_ROOMS')
@Index('IDX_UR_USER', ['userId'])
@Index('IDX_UR_ROOM', ['roomId'])
@Index('IDX_UR_ACTIVE', ['isActive'])
export class UserRoom extends BaseEntity {
    @Column({ name: 'USER_ID', type: 'varchar2', length: 36 })
    userId: string;

    @Column({ name: 'ROOM_ID', type: 'varchar2', length: 36 })
    roomId: string;

    @Column({ name: 'IS_ACTIVE', type: 'number', default: 1 })
    isActive: boolean;

    // Relationships
    @ManyToOne(() => User)
    @JoinColumn({ name: 'USER_ID' })
    user: User;

    @ManyToOne(() => Room)
    @JoinColumn({ name: 'ROOM_ID' })
    room: Room;

    // Business methods
    isUserRoomActive(): boolean {
        return this.isActive && !this.deletedAt;
    }

    activate(): void {
        this.isActive = true;
    }

    deactivate(): void {
        this.isActive = false;
    }
}
