import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Province } from '../../province/entities/province.entity';

@Entity('BML_WARDS')
export class Ward extends BaseEntity {

    // ========== BUSINESS FIELDS ==========
    @Column({ name: 'WARD_CODE', unique: true })
    wardCode: string;           // Mã xã (VD: "01001", "01002")

    @Column({ name: 'WARD_NAME' })
    wardName: string;           // Tên xã (VD: "Phường Phúc Xá", "Phường Trúc Bạch")

    @Column({ name: 'PROVINCE_ID', type: 'varchar2', length: 36 })
    provinceId: string;         // ID tỉnh (Foreign Key)

    @Column({ name: 'SHORT_NAME' })
    shortName: string;          // Viết tắt (VD: "PX", "TB")

    @Column({ name: 'SORT_ORDER', type: 'number' })
    sortOrder: number;          // Thứ tự sắp xếp

    @Column({ name: 'IS_ACTIVE', default: true })
    isActive: boolean;          // Trạng thái hoạt động

    // ========== RELATIONSHIPS ==========
    @ManyToOne(() => Province)
    @JoinColumn({ name: 'PROVINCE_ID' })
    province: Province;

    getDisplayName(): string {
        return `${this.wardCode} - ${this.wardName}`;
    }

    isWardActive(): boolean {
        return this.isActive && !this.deletedAt;
    }

    // ========== VALIDATION METHODS ==========
    validateWardCode(): boolean {
        return /^[0-9]{5}$/.test(this.wardCode);
    }

    validateWardName(): boolean {
        return this.wardName && this.wardName.trim().length >= 2;
    }

    validateShortName(): boolean {
        return this.shortName && this.shortName.trim().length >= 2;
    }

    // ========== HELPER METHODS ==========
    toJSON() {
        return {
            id: this.id,
            wardCode: this.wardCode,
            wardName: this.wardName,
            provinceId: this.provinceId,
            shortName: this.shortName,
            sortOrder: this.sortOrder,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy,
            updatedBy: this.updatedBy,
            version: this.version,
        };
    }
}
