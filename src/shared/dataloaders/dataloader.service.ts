import { Injectable, Inject } from '@nestjs/common';
import DataLoader from 'dataloader';
import { User } from '../../modules/user/entities/user.entity';
import { Province } from '../../modules/province/entities/province.entity';
import { Ward } from '../../modules/ward/entities/ward.entity';
import { Branch } from '../../modules/branch/entities/branch.entity';
import { Department } from '../../modules/department/entities/department.entity';
import { RoomGroup } from '../../modules/room-group/entities/room-group.entity';
import { IUserRepository } from '../../modules/user/interfaces/user.repository.interface';
import { IProvinceRepository } from '../../modules/province/interfaces/province.repository.interface';
import { IWardRepository } from '../../modules/ward/interfaces/ward.repository.interface';
import { IBranchRepository } from '../../modules/branch/interfaces/branch.repository.interface';
import { IDepartmentRepository } from '../../modules/department/interfaces/department.repository.interface';
import { IRoomGroupRepository } from '../../modules/room-group/interfaces/room-group.repository.interface';

export interface DataLoaders {
    userLoader: DataLoader<string, User>;
    provinceLoader: DataLoader<string, Province>;
    wardLoader: DataLoader<string, Ward>;
    branchLoader: DataLoader<string, Branch>;
    departmentLoader: DataLoader<string, Department>;
    roomGroupLoader: DataLoader<string, RoomGroup>;
    wardsByProvinceLoader: DataLoader<string, Ward[]>;
    branchesByProvinceLoader: DataLoader<string, Branch[]>;
    branchesByWardLoader: DataLoader<string, Branch[]>;
    departmentsByBranchLoader: DataLoader<string, Department[]>;
    departmentsByTypeLoader: DataLoader<string, Department[]>;
    departmentsByParentLoader: DataLoader<string, Department[]>;
}

@Injectable()
export class DataLoaderService {
    constructor(
        @Inject('IUserRepository')
        private readonly userRepository: IUserRepository,
        @Inject('IProvinceRepository')
        private readonly provinceRepository: IProvinceRepository,
        @Inject('IWardRepository')
        private readonly wardRepository: IWardRepository,
        @Inject('IBranchRepository')
        private readonly branchRepository: IBranchRepository,
        @Inject('IDepartmentRepository')
        private readonly departmentRepository: IDepartmentRepository,
        @Inject('IRoomGroupRepository')
        private readonly roomGroupRepository: IRoomGroupRepository,
    ) { }

    /**
     * Create User DataLoader
     * Batch loads users by IDs
     */
    createUserLoader(): DataLoader<string, User> {
        return new DataLoader<string, User>(async (userIds: readonly string[]) => {
            const users = await this.userRepository.findByIds([...userIds]);
            const userMap = new Map(users.map(user => [user.id, user]));
            return userIds.map(id => userMap.get(id) || null);
        });
    }

    /**
     * Create Province DataLoader
     * Batch loads provinces by IDs
     */
    createProvinceLoader(): DataLoader<string, Province> {
        return new DataLoader<string, Province>(async (provinceIds: readonly string[]) => {
            const provinces = await this.provinceRepository.findByIds([...provinceIds]);
            const provinceMap = new Map(provinces.map(province => [province.id, province]));
            return provinceIds.map(id => provinceMap.get(id) || null);
        });
    }

    /**
     * Create Ward DataLoader
     * Batch loads wards by IDs
     */
    createWardLoader(): DataLoader<string, Ward> {
        return new DataLoader<string, Ward>(async (wardIds: readonly string[]) => {
            const wards = await this.wardRepository.findByIds([...wardIds]);
            const wardMap = new Map(wards.map(ward => [ward.id, ward]));
            return wardIds.map(id => wardMap.get(id) || null);
        });
    }

    /**
     * Create Branch DataLoader
     * Batch loads branches by IDs
     */
    createBranchLoader(): DataLoader<string, Branch> {
        return new DataLoader<string, Branch>(async (branchIds: readonly string[]) => {
            const branches = await this.branchRepository.findByIds([...branchIds]);
            const branchMap = new Map(branches.map(branch => [branch.id, branch]));
            return branchIds.map(id => branchMap.get(id) || null);
        });
    }

    /**
     * Create Wards by Province DataLoader
     * Batch loads wards grouped by province ID
     */
    createWardsByProvinceLoader(): DataLoader<string, Ward[]> {
        return new DataLoader<string, Ward[]>(async (provinceIds: readonly string[]) => {
            const wards = await this.wardRepository.findByProvinceIds([...provinceIds]);
            const wardsByProvince = new Map<string, Ward[]>();

            // Group wards by province ID
            wards.forEach(ward => {
                if (!wardsByProvince.has(ward.provinceId)) {
                    wardsByProvince.set(ward.provinceId, []);
                }
                wardsByProvince.get(ward.provinceId)!.push(ward);
            });

            return provinceIds.map(provinceId => wardsByProvince.get(provinceId) || []);
        });
    }

    /**
     * Create Branches by Province DataLoader
     * Batch loads branches grouped by province ID
     */
    createBranchesByProvinceLoader(): DataLoader<string, Branch[]> {
        return new DataLoader<string, Branch[]>(async (provinceIds: readonly string[]) => {
            const branches = await this.branchRepository.findByProvinceIds([...provinceIds]);
            const branchesByProvince = new Map<string, Branch[]>();

            // Group branches by province ID
            branches.forEach(branch => {
                if (!branchesByProvince.has(branch.provinceId)) {
                    branchesByProvince.set(branch.provinceId, []);
                }
                branchesByProvince.get(branch.provinceId)!.push(branch);
            });

            return provinceIds.map(provinceId => branchesByProvince.get(provinceId) || []);
        });
    }

    /**
     * Create Branches by Ward DataLoader
     * Batch loads branches grouped by ward ID
     */
    createBranchesByWardLoader(): DataLoader<string, Branch[]> {
        return new DataLoader<string, Branch[]>(async (wardIds: readonly string[]) => {
            const branches = await this.branchRepository.findByWardIds([...wardIds]);
            const branchesByWard = new Map<string, Branch[]>();

            // Group branches by ward ID
            branches.forEach(branch => {
                if (!branchesByWard.has(branch.wardId)) {
                    branchesByWard.set(branch.wardId, []);
                }
                branchesByWard.get(branch.wardId)!.push(branch);
            });

            return wardIds.map(wardId => branchesByWard.get(wardId) || []);
        });
    }

    /**
     * Create Department DataLoader
     * Batch loads departments by IDs
     */
    createDepartmentLoader(): DataLoader<string, Department> {
        return new DataLoader<string, Department>(async (departmentIds: readonly string[]) => {
            const departments = await this.departmentRepository.findByIds([...departmentIds]);
            const departmentMap = new Map(departments.map(department => [department.id, department]));
            return departmentIds.map(id => departmentMap.get(id) || null);
        });
    }

    /**
     * Create RoomGroup DataLoader
     * Batch loads room groups by IDs
     */
    createRoomGroupLoader(): DataLoader<string, RoomGroup> {
        return new DataLoader<string, RoomGroup>(async (roomGroupIds: readonly string[]) => {
            const roomGroups = await this.roomGroupRepository.findByIds([...roomGroupIds]);
            const roomGroupMap = new Map(roomGroups.map(roomGroup => [roomGroup.id, roomGroup]));
            return roomGroupIds.map(id => roomGroupMap.get(id) || null);
        });
    }

    /**
     * Create Departments by Branch DataLoader
     * Batch loads departments grouped by branch ID
     */
    createDepartmentsByBranchLoader(): DataLoader<string, Department[]> {
        return new DataLoader<string, Department[]>(async (branchIds: readonly string[]) => {
            const departments = await this.departmentRepository.findByBranchIds([...branchIds]);
            const departmentsByBranch = new Map<string, Department[]>();

            // Group departments by branch ID
            departments.forEach(department => {
                if (!departmentsByBranch.has(department.branchId)) {
                    departmentsByBranch.set(department.branchId, []);
                }
                departmentsByBranch.get(department.branchId)!.push(department);
            });

            return branchIds.map(branchId => departmentsByBranch.get(branchId) || []);
        });
    }

    /**
     * Create Departments by Type DataLoader
     * Batch loads departments grouped by department type ID
     */
    createDepartmentsByTypeLoader(): DataLoader<string, Department[]> {
        return new DataLoader<string, Department[]>(async (departmentTypeIds: readonly string[]) => {
            const departments = await this.departmentRepository.findByDepartmentTypeIds([...departmentTypeIds]);
            const departmentsByType = new Map<string, Department[]>();

            // Group departments by department type ID
            departments.forEach(department => {
                if (!departmentsByType.has(department.departmentTypeId)) {
                    departmentsByType.set(department.departmentTypeId, []);
                }
                departmentsByType.get(department.departmentTypeId)!.push(department);
            });

            return departmentTypeIds.map(departmentTypeId => departmentsByType.get(departmentTypeId) || []);
        });
    }

    /**
     * Create Departments by Parent DataLoader
     * Batch loads departments grouped by parent department ID
     */
    createDepartmentsByParentLoader(): DataLoader<string, Department[]> {
        return new DataLoader<string, Department[]>(async (parentDepartmentIds: readonly string[]) => {
            const departments = await Promise.all(
                parentDepartmentIds.map(parentId => this.departmentRepository.findChildrenByParentId(parentId))
            );

            const departmentsByParent = new Map<string, Department[]>();
            parentDepartmentIds.forEach((parentId, index) => {
                departmentsByParent.set(parentId, departments[index]);
            });

            return parentDepartmentIds.map(parentId => departmentsByParent.get(parentId) || []);
        });
    }

    /**
     * Create all DataLoaders for a request
     * Each request gets its own set of DataLoaders
     */
    createLoaders(): DataLoaders {
        return {
            userLoader: this.createUserLoader(),
            provinceLoader: this.createProvinceLoader(),
            wardLoader: this.createWardLoader(),
            branchLoader: this.createBranchLoader(),
            departmentLoader: this.createDepartmentLoader(),
            roomGroupLoader: this.createRoomGroupLoader(),
            wardsByProvinceLoader: this.createWardsByProvinceLoader(),
            branchesByProvinceLoader: this.createBranchesByProvinceLoader(),
            branchesByWardLoader: this.createBranchesByWardLoader(),
            departmentsByBranchLoader: this.createDepartmentsByBranchLoader(),
            departmentsByTypeLoader: this.createDepartmentsByTypeLoader(),
            departmentsByParentLoader: this.createDepartmentsByParentLoader(),
        };
    }

    /**
     * Clear all DataLoaders (useful for testing)
     */
    clearLoaders(loaders: DataLoaders): void {
        Object.values(loaders).forEach(loader => loader.clearAll());
    }
}