import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Province } from '../../province/entities/province.entity';
import { Ward } from '../../ward/entities/ward.entity';

@Entity('BML_PATIENTS')
export class Patient extends BaseEntity {
    @Column({ name: 'PATIENT_CODE', unique: true })
    patientCode: string; // Mã bệnh nhân tự sinh

    @Column({ name: 'PATIENT_NAME' })
    patientName: string; // Họ tên bệnh nhân

    @Column({ name: 'DATE_OF_BIRTH', type: 'date' })
    dateOfBirth: Date; // Ngày sinh

    @Column({ name: 'CMND_NUMBER', unique: true })
    cmndNumber: string; // Số CMND/CCCD

    @Column({ name: 'CMND_DATE', type: 'date', nullable: true })
    cmndDate?: Date; // Ngày cấp CMND

    @Column({ name: 'CMND_PLACE', nullable: true })
    cmndPlace?: string; // Nơi cấp CMND

    @Column({ name: 'MOBILE', nullable: true })
    mobile?: string; // Số điện thoại di động

    @Column({ name: 'PHONE', nullable: true })
    phone?: string; // Số điện thoại cố định

    @Column({ name: 'PROVINCE_ID', type: 'varchar2', length: 36 })
    provinceId: string; // ID tỉnh

    @Column({ name: 'WARD_ID', type: 'varchar2', length: 36 })
    wardId: string; // ID phường/xã

    @Column({ name: 'ADDRESS', type: 'varchar2', length: 500 })
    address: string; // Địa chỉ chi tiết

    @Column({ name: 'GENDER_ID', type: 'varchar2', length: 36 })
    genderId: string; // ID giới tính

    @Column({ name: 'GENDER_NAME' })
    genderName: string; // Tên giới tính

    @Column({ name: 'CAREER_NAME', nullable: true })
    careerName?: string; // Nghề nghiệp

    @Column({ name: 'HIS_ID', nullable: true })
    hisId?: string; // ID từ hệ thống HIS

    // Relationships
    @ManyToOne(() => Province)
    @JoinColumn({ name: 'PROVINCE_ID' })
    province: Province;

    @ManyToOne(() => Ward)
    @JoinColumn({ name: 'WARD_ID' })
    ward: Ward;

    // Business methods
    calculateAge(): number {
        const today = new Date();
        const birthDate = new Date(this.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    getFullAddress(): string {
        return `${this.address}, ${this.ward?.wardName || ''}, ${this.province?.provinceName || ''}`;
    }

    getDisplayName(): string {
        return `${this.patientCode} - ${this.patientName}`;
    }
}
