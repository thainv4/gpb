import { Entity, Column, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('BML_USERS')
export class User extends BaseEntity {
    @Column({ name: 'USERNAME', unique: true })
    username: string;

    @Column({ name: 'EMAIL', unique: true })
    email: string;

    @Column({ name: 'PASSWORD_HASH' })
    passwordHash: string;

    @Column({ name: 'FULL_NAME' })
    fullName: string;

    @Column({ name: 'IS_ACTIVE', default: true })
    isActive: boolean;

    @Column({ name: 'PHONE_NUMBER', nullable: true })
    phoneNumber?: string;

    @Column({ name: 'DATE_OF_BIRTH', type: 'timestamp', nullable: true })
    dateOfBirth?: Date;

    @Column({ name: 'ADDRESS', type: 'varchar2', length: 2000, nullable: true })
    address?: string;

    // Relationship với Profile
    @OneToOne('Profile', 'user')
    profile?: any;

    // Business methods
    isAccountActive(): boolean {
        return this.isActive && !this.deletedAt;
    }

    hasProfile(): boolean {
        return !!this.profile;
    }

    getProfileData(): any {
        return this.profile ? {
            provinceId: this.profile.provinceId,
            wardId: this.profile.wardId,
            address: this.profile.address,
            departmentId: this.profile.departmentId,
            position: this.profile.position,
            employeeCode: this.profile.employeeCode,
            phoneNumber: this.profile.phoneNumber,
            dateOfBirth: this.profile.dateOfBirth,
            gender: this.profile.gender,
            avatar: this.profile.avatar,
            mappedUsername: this.profile.mappedUsername,
            hasMappedPassword: !!this.profile.mappedPassword,
        } : null;
    }
}
