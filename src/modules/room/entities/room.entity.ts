import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Department } from '../../department/entities/department.entity';

@Entity('BML_ROOMS')
@Index('IDX_BML_ROOMS_CODE', ['roomCode'])
@Index('IDX_BML_ROOMS_NAME', ['roomName'])
@Index('IDX_BML_ROOMS_DEPT', ['departmentId'])
@Index('IDX_BML_ROOMS_ACTIVE', ['isActive'])
export class Room extends BaseEntity {
    // ========== BUSINESS FIELDS ==========
    @Column({ name: 'ROOM_CODE', unique: true, length: 20 })
    roomCode: string;           // Mã phòng (VD: "P001", "P002")

    @Column({ name: 'ROOM_NAME', length: 100 })
    roomName: string;           // Tên phòng (VD: "Phòng 101", "Phòng 201")

    @Column({ name: 'ROOM_ADDRESS', length: 200, nullable: true })
    roomAddress?: string;       // Địa chỉ phòng (VD: "Tầng 1, Khu A")

    @Column({ name: 'DEPARTMENT_ID', type: 'varchar2', length: 36 })
    departmentId: string;       // ID khoa (Foreign Key)

    @Column({ name: 'DESCRIPTION', type: 'clob', nullable: true })
    description?: string;        // Mô tả phòng

    @Column({ name: 'SELECT_PREFIX', type: 'varchar2', length: 20, nullable: true })
    selectPrefix?: string;       // Tiền tố chọn (20 byte)

    @Column({ name: 'IS_ACTIVE', default: true })
    isActive: boolean;          // Trạng thái hoạt động

    @Column({ name: 'SORT_ORDER', type: 'number', default: 0 })
    sortOrder: number;          // Thứ tự sắp xếp

    // ========== RELATIONSHIPS ==========
    @ManyToOne(() => Department)
    @JoinColumn({ name: 'DEPARTMENT_ID' })
    department: Department;

    // ========== BUSINESS METHODS ==========
    getDisplayName(): string {
        return `${this.roomCode} - ${this.roomName}`;
    }

    getFullName(): string {
        return this.roomName;
    }

    isAvailable(): boolean {
        return this.isActive && !this.deletedAt;
    }
}
