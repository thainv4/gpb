import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('BML_PROVINCES')
export class Province extends BaseEntity {

    // ========== BUSINESS FIELDS ==========
    @Column({ name: 'PROVINCE_CODE', unique: true })
    provinceCode: string;        // Mã tỉnh (VD: "01", "79")

    @Column({ name: 'PROVINCE_NAME' })
    provinceName: string;         // Tên tỉnh (VD: "Hà Nội", "TP.HCM")

    @Column({ name: 'SHORT_NAME' })
    shortName: string;            // Viết tắt (VD: "HN", "HCM")

    @Column({ name: 'SORT_ORDER', type: 'number' })
    sortOrder: number;            // Thứ tự sắp xếp

    @Column({ name: 'IS_ACTIVE', default: true })
    isActive: boolean;            // Trạng thái hoạt động

    // ========== RELATIONSHIPS ==========
    // Note: Ward relationship will be defined in Ward entity to avoid circular dependency

    getDisplayName(): string {
        return `${this.provinceCode} - ${this.provinceName}`;
    }

    isProvinceActive(): boolean {
        return this.isActive && !this.deletedAt;
    }

    // ========== VALIDATION METHODS ==========
    validateProvinceCode(): boolean {
        return /^[0-9]{2}$/.test(this.provinceCode);
    }

    validateProvinceName(): boolean {
        return this.provinceName && this.provinceName.trim().length >= 2;
    }

    validateShortName(): boolean {
        return this.shortName && this.shortName.trim().length >= 2;
    }

    // ========== HELPER METHODS ==========
    toJSON() {
        return {
            id: this.id,
            provinceCode: this.provinceCode,
            provinceName: this.provinceName,
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
