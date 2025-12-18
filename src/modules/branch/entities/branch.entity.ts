import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Province } from '../../province/entities/province.entity';
import { Ward } from '../../ward/entities/ward.entity';

@Entity('BML_BRANCHES')
export class Branch extends BaseEntity {

    // ========== BUSINESS FIELDS ==========
    @Column({ name: 'BRANCH_CODE', unique: true })
    branchCode: string;           // Mã chi nhánh (VD: "HN001", "HCM001")

    @Column({ name: 'BRANCH_NAME' })
    branchName: string;           // Tên chi nhánh (VD: "Chi nhánh Hà Nội", "Chi nhánh TP.HCM")

    @Column({ name: 'SHORT_NAME' })
    shortName: string;            // Tên viết tắt (VD: "CN HN", "CN HCM")

    @Column({ name: 'PROVINCE_ID', type: 'varchar2', length: 36 })
    provinceId: string;           // ID tỉnh (Foreign Key)

    @Column({ name: 'WARD_ID', type: 'varchar2', length: 36 })
    wardId: string;               // ID xã (Foreign Key)

    @Column({ name: 'ADDRESS', type: 'varchar2', length: 500 })
    address: string;              // Địa chỉ chi tiết

    @Column({ name: 'PHONE_NUMBER', type: 'varchar2', length: 20 })
    phoneNumber: string;          // Số điện thoại

    @Column({ name: 'HOSPITAL_LEVEL', type: 'varchar2', length: 50 })
    hospitalLevel: string;        // Cấp bệnh viện (VD: "Tuyến 1", "Tuyến 2", "Tuyến 3")

    @Column({ name: 'REPRESENTATIVE', type: 'varchar2', length: 100 })
    representative: string;        // Người đại diện

    @Column({ name: 'BHYT_CODE', type: 'varchar2', length: 20 })
    bhyCode: string;              // Mã BHYT

    @Column({ name: 'IS_ACTIVE', default: true })
    isActive: boolean;            // Trạng thái hoạt động


    // ========== RELATIONSHIPS ==========
    @ManyToOne(() => Province)
    @JoinColumn({ name: 'PROVINCE_ID' })
    province: Province;

    @ManyToOne(() => Ward)
    @JoinColumn({ name: 'WARD_ID' })
    ward: Ward;

    // One-to-Many relationship with Department
    @OneToMany('Department', 'branch')
    departments: any[];

    // ========== BUSINESS METHODS ==========

    getDisplayName(): string {
        return `${this.branchCode} - ${this.branchName}`;
    }

    isBranchActive(): boolean {
        return this.isActive && !this.deletedAt;
    }

    getFullAddress(): string {
        if (this.ward && this.province) {
            return `${this.address}, ${this.ward.wardName}, ${this.province.provinceName}`;
        }
        return this.address;
    }

    // ========== VALIDATION METHODS ==========
    validateBranchCode(): boolean {
        return /^[A-Z]{2,3}[0-9]{3}$/.test(this.branchCode);
    }

    validateBranchName(): boolean {
        return this.branchName && this.branchName.trim().length >= 2;
    }

    validateShortName(): boolean {
        return this.shortName && this.shortName.trim().length >= 2;
    }

    validatePhoneNumber(): boolean {
        return /^(\+84|84|0)[1-9][0-9]{8,9}$/.test(this.phoneNumber);
    }

    validateHospitalLevel(): boolean {
        const validLevels = ['Tuyến 1', 'Tuyến 2', 'Tuyến 3', 'Tuyến 4'];
        return validLevels.includes(this.hospitalLevel);
    }

    validateBhyCode(): boolean {
        return /^[0-9]{10,15}$/.test(this.bhyCode);
    }

    // ========== HELPER METHODS ==========
    toJSON() {
        return {
            id: this.id,
            branchCode: this.branchCode,
            branchName: this.branchName,
            shortName: this.shortName,
            provinceId: this.provinceId,
            wardId: this.wardId,
            address: this.address,
            phoneNumber: this.phoneNumber,
            hospitalLevel: this.hospitalLevel,
            representative: this.representative,
            bhyCode: this.bhyCode,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy,
            updatedBy: this.updatedBy,
            version: this.version,
        };
    }
}
