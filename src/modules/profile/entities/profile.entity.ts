import { Entity, Column, Index, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Province } from '../../province/entities/province.entity';
import { Ward } from '../../ward/entities/ward.entity';
import { Department } from '../../department/entities/department.entity';

@Entity('BML_PROFILES')
@Index('IDX_BML_PROF_USR', ['userId'])
@Index('IDX_BML_PROF_EMP', ['employeeCode'])
@Index('IDX_BML_PROF_PHN', ['phoneNumber'])
@Index('IDX_BML_PROF_PRV', ['provinceId'])
@Index('IDX_BML_PROF_WRD', ['wardId'])
@Index('IDX_BML_PROF_DEP', ['departmentId'])
export class Profile extends BaseEntity {
    @Column({ name: 'USER_ID', type: 'varchar2', length: 36, unique: true })
    userId: string;

    // Thông tin địa chỉ
    @Column({ name: 'PROVINCE_ID', type: 'varchar2', length: 36, nullable: true })
    provinceId?: string;

    @Column({ name: 'WARD_ID', type: 'varchar2', length: 36, nullable: true })
    wardId?: string;

    @Column({ name: 'ADDRESS', type: 'varchar2', length: 500, nullable: true })
    address?: string;

    // Thông tin công việc
    @Column({ name: 'DEPARTMENT_ID', type: 'varchar2', length: 36, nullable: true })
    departmentId?: string;

    @Column({ name: 'POSITION', type: 'varchar2', length: 100, nullable: true })
    position?: string;

    @Column({ name: 'EMPLOYEE_CODE', type: 'varchar2', length: 50, nullable: true })
    employeeCode?: string;

    // Thông tin cá nhân
    @Column({ name: 'PHONE_NUMBER', type: 'varchar2', length: 20, nullable: true })
    phoneNumber?: string;

    @Column({ name: 'DATE_OF_BIRTH', type: 'date', nullable: true })
    dateOfBirth?: Date;

    @Column({ name: 'GENDER', type: 'varchar2', length: 10, nullable: true })
    gender?: string;

    @Column({ name: 'AVATAR', type: 'varchar2', length: 500, nullable: true })
    avatar?: string;

    // Mapping fields
    @Column({ name: 'MAPPED_USERNAME', type: 'varchar2', length: 100, nullable: true })
    mappedUsername?: string;

    @Column({ name: 'MAPPED_PASSWORD', type: 'varchar2', length: 255, nullable: true })
    mappedPassword?: string;

    // Relationships
    @OneToOne(() => User, user => user.profile)
    @JoinColumn({ name: 'USER_ID' })
    user: User;

    @ManyToOne(() => Province)
    @JoinColumn({ name: 'PROVINCE_ID' })
    province?: Province;

    @ManyToOne(() => Ward)
    @JoinColumn({ name: 'WARD_ID' })
    ward?: Ward;

    @ManyToOne(() => Department)
    @JoinColumn({ name: 'DEPARTMENT_ID' })
    department?: Department;

    // Business methods
    getFullAddress(): string {
        const parts = [this.address, this.ward?.wardName, this.province?.provinceName];
        return parts.filter(Boolean).join(', ');
    }

    getWorkInfo(): string {
        const parts = [this.position, this.department?.departmentName];
        return parts.filter(Boolean).join(' - ');
    }

    hasMappingCredentials(): boolean {
        return !!(this.mappedUsername && this.mappedPassword);
    }

    getAge(): number | null {
        if (!this.dateOfBirth) return null;
        const today = new Date();
        const birthDate = new Date(this.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            provinceId: this.provinceId,
            wardId: this.wardId,
            address: this.address,
            departmentId: this.departmentId,
            position: this.position,
            employeeCode: this.employeeCode,
            phoneNumber: this.phoneNumber,
            dateOfBirth: this.dateOfBirth,
            gender: this.gender,
            avatar: this.avatar,
            mappedUsername: this.mappedUsername,
            hasMappedPassword: !!this.mappedPassword,
            fullAddress: this.getFullAddress(),
            workInfo: this.getWorkInfo(),
            age: this.getAge(),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy,
            updatedBy: this.updatedBy,
            version: this.version,
        };
    }
}
