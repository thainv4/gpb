import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HisExecuteRole } from './entities/his-execute-role.entity';
import { HisEkipUser } from './entities/his-ekip-user.entity';
import { GetHisEkipUsersQueryDto } from './dto/queries/get-his-ekip-users-query.dto';
import { HisExecuteRoleResponseDto } from './dto/responses/his-execute-role-response.dto';
import { HisEkipUserResponseDto } from './dto/responses/his-ekip-user-response.dto';

@Injectable()
export class HisEkipService {
    constructor(
        @InjectRepository(HisExecuteRole, 'hisConnection')
        private readonly executeRoleRepo: Repository<HisExecuteRole>,
        @InjectRepository(HisEkipUser, 'hisConnection')
        private readonly ekipUserRepo: Repository<HisEkipUser>,
    ) {}

    async listActiveExecuteRoles(): Promise<HisExecuteRoleResponseDto[]> {
        const rows = await this.executeRoleRepo.find({
            where: { isActive: 1 },
            select: ['id', 'executeRoleName'],
            order: { id: 'ASC' },
        });
        return rows.map((r) => ({
            id: r.id,
            executeRoleName: r.executeRoleName,
        }));
    }

    async listEkipUsersByDepartment(dto: GetHisEkipUsersQueryDto): Promise<HisEkipUserResponseDto[]> {
        const { departmentId, executeRoleId } = dto;

        const rows = await this.ekipUserRepo.find({
            where: { departmentId, executeRoleId },
            select: ['id', 'username', 'loginname'],
            order: { loginname: 'ASC' },
        });

        return rows.map((row) => ({
            id: row.id,
            username: row.username ?? null,
            loginname: row.loginname,
        }));
    }
}
