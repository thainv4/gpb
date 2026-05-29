import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { CurrentUser } from '../../../common/interfaces/current-user.interface';
import { IUserRepository } from '../../user/interfaces/user.repository.interface';
import { IUserRoomRepository } from '../../user-room/interfaces/user-room.repository.interface';
import { IRoomRepository } from '../../room/interfaces/room.repository.interface';
import { StoredServiceRequest } from '../../service-request/entities/stored-service-request.entity';
import { StoredServiceRequestService } from '../../service-request/entities/stored-service-request-service.entity';
import { ServiceRequestAuditLog } from '../entities/service-request-audit-log.entity';
import {
    AUDIT_EVENT_TITLES,
    AuditEventCode,
    AuditScope,
    categoryForEventCode,
} from '../constants/audit-log.constants';
import { IServiceRequestAuditLogRepository } from '../interfaces/service-request-audit-log.repository.interface';
import { GetAuditLogsDto } from '../dto/queries/get-audit-logs.dto';
import {
    AuditLogResponseDto,
    LatestResultSaveAuditDto,
} from '../dto/responses/audit-log-response.dto';
import { AuditSuppressContext } from '../helpers/audit-suppress.context';

export interface AppendAuditLogInput {
    eventCode: AuditEventCode;
    storedServiceReqId: string;
    scope: AuditScope;
    storedServiceId?: string | null;
    actionRoomId?: string | null;
    summary?: string | null;
    notes?: string | null;
    payload?: Record<string, unknown> | null;
    correlationId?: string | null;
    /** Denormalize override khi đã có sẵn (vd. trước khi xóa workflow) */
    serviceReqCode?: string | null;
    hisServiceReqCode?: string | null;
    receptionCode?: string | null;
    patientCode?: string | null;
    patientName?: string | null;
    serviceName?: string | null;
}

@Injectable()
export class ServiceRequestAuditLogService {
    private readonly logger = new Logger(ServiceRequestAuditLogService.name);

    constructor(
        @Inject('IServiceRequestAuditLogRepository')
        private readonly auditRepo: IServiceRequestAuditLogRepository,
        @Inject('IUserRepository')
        private readonly userRepo: IUserRepository,
        @Inject('IUserRoomRepository')
        private readonly userRoomRepo: IUserRoomRepository,
        @Inject('IRoomRepository')
        private readonly roomRepo: IRoomRepository,
        @InjectRepository(StoredServiceRequest)
        private readonly storedReqRepo: Repository<StoredServiceRequest>,
        @InjectRepository(StoredServiceRequestService)
        private readonly storedServiceRepo: Repository<StoredServiceRequestService>,
        private readonly auditSuppress: AuditSuppressContext,
    ) {}

    /** Ghi log — fail-soft, không throw ra ngoài. */
    async safeAppend(input: AppendAuditLogInput, currentUser: CurrentUser): Promise<void> {
        if (this.auditSuppress.isSuppressed()) {
            return;
        }
        try {
            await this.append(input, currentUser);
        } catch (error) {
            this.logger.error(
                `Failed to append audit log ${input.eventCode} for req=${input.storedServiceReqId}`,
                error instanceof Error ? error.stack : String(error),
            );
        }
    }

    async append(input: AppendAuditLogInput, currentUser: CurrentUser): Promise<string> {
        const user = await this.userRepo.findById(currentUser.id);
        const actionUsername = user?.username ?? currentUser.username ?? '';
        const actionUserFullName = user?.fullName ?? null;

        let actionRoomName: string | null = null;
        if (input.actionRoomId) {
            const room = await this.roomRepo.findById(input.actionRoomId);
            actionRoomName = room?.roomName ?? null;
        }

        const storedRequest = await this.storedReqRepo.findOne({
            where: { id: input.storedServiceReqId },
        });
        if (!storedRequest) {
            throw new NotFoundException(`Stored service request ${input.storedServiceReqId} not found`);
        }

        let serviceRow: StoredServiceRequestService | null = null;
        if (input.storedServiceId) {
            serviceRow = await this.storedServiceRepo.findOne({
                where: { id: input.storedServiceId },
            });
        }

        const entity = new ServiceRequestAuditLog();
        entity.occurredAt = new Date();
        entity.eventCode = input.eventCode;
        entity.eventCategory = categoryForEventCode(input.eventCode);
        entity.eventTitle = AUDIT_EVENT_TITLES[input.eventCode];
        entity.scope = input.scope;
        entity.storedServiceReqId = input.storedServiceReqId;
        entity.storedServiceId = input.storedServiceId ?? null;
        entity.actionUserId = currentUser.id;
        entity.actionUsername = actionUsername;
        entity.actionUserFullName = actionUserFullName;
        entity.actionRoomId = input.actionRoomId ?? null;
        entity.actionRoomName = actionRoomName;
        entity.summary = input.summary ?? null;
        entity.notes = input.notes ?? null;
        entity.correlationId = input.correlationId ?? null;
        entity.payload = input.payload ? JSON.stringify(input.payload) : null;
        entity.createdBy = currentUser.id;
        entity.updatedBy = currentUser.id;

        entity.serviceReqCode =
            input.serviceReqCode ?? storedRequest.serviceReqCode ?? null;
        entity.hisServiceReqCode =
            input.hisServiceReqCode ?? storedRequest.hisServiceReqCode ?? null;
        entity.patientCode = input.patientCode ?? storedRequest.patientCode ?? null;
        entity.patientName = input.patientName ?? storedRequest.patientName ?? null;
        entity.receptionCode =
            input.receptionCode ?? serviceRow?.receptionCode ?? null;
        entity.serviceName = input.serviceName ?? serviceRow?.serviceName ?? null;

        const saved = await this.auditRepo.save(entity);
        return saved.id;
    }

    async getList(
        query: GetAuditLogsDto,
        currentUser: CurrentUser | null,
    ): Promise<{ items: AuditLogResponseDto[]; total: number; limit: number; offset: number }> {
        const fromDate = query.fromDate ? new Date(query.fromDate) : undefined;
        const toDate = query.toDate ? new Date(query.toDate) : undefined;
        if (fromDate && toDate && fromDate > toDate) {
            throw new BadRequestException('From date không được lớn hơn To date');
        }

        const code = query.code?.trim();
        if (!code) {
            throw new BadRequestException('Tham số code (mã phiếu) là bắt buộc');
        }

        const { roomId, roomIds } = await this.resolveRoomScope(query.roomId, currentUser);
        const limit = query.limit ?? 20;
        const offset = query.offset ?? 0;

        const { items, total } = await this.auditRepo.findMany({
            fromDate,
            toDate,
            code,
            patientName: query.patientName,
            roomId,
            roomIds,
            eventCategories: query.eventCategory,
            limit,
            offset,
        });

        return {
            items: items.map((e) => AuditLogResponseDto.fromEntity(e, true)),
            total,
            limit,
            offset,
        };
    }

    async getById(id: string): Promise<AuditLogResponseDto> {
        const entity = await this.auditRepo.findById(id);
        if (!entity) {
            throw new NotFoundException('Audit log không tìm thấy');
        }
        return AuditLogResponseDto.fromEntity(entity, true);
    }

    /**
     * Cập nhật payload snapshot của dòng TICKET_STORED mới nhất theo storedServiceReqId.
     * Dùng khi cần "nhét" trạng thái HIS-PACS start vào đúng dòng đã lưu phiếu.
     */
    async mergeLatestTicketStoredSnapshot(
        storedServiceReqId: string,
        patch: Record<string, unknown>,
    ): Promise<void> {
        const target = await this.auditRepo.findLatestByReqAndEventCode(
            storedServiceReqId,
            AuditEventCode.TICKET_STORED,
        );
        if (!target) {
            return;
        }

        let payload: Record<string, unknown> = {};
        if (target.payload) {
            try {
                payload = JSON.parse(target.payload) as Record<string, unknown>;
            } catch {
                payload = {};
            }
        }
        const snapshot =
            payload.snapshot && typeof payload.snapshot === 'object'
                ? (payload.snapshot as Record<string, unknown>)
                : {};

        target.payload = JSON.stringify({
            ...payload,
            snapshot: {
                ...snapshot,
                ...patch,
            },
        });
        await this.auditRepo.save(target);
    }

    async getLatestResultSave(storedServiceId: string): Promise<LatestResultSaveAuditDto | null> {
        const row = await this.auditRepo.findLatestByEventCode(
            storedServiceId,
            AuditEventCode.RESULT_SAVE,
        );
        if (!row) {
            return null;
        }
        return {
            storedServiceId,
            occurredAt: row.occurredAt,
            actionUserId: row.actionUserId,
            actionUsername: row.actionUsername,
            actionUserFullName: row.actionUserFullName,
        };
    }

    async exportExcel(
        query: GetAuditLogsDto,
        currentUser: CurrentUser | null,
        res: Response,
    ): Promise<void> {
        const maxRows = 200_000;
        const exportQuery = { ...query, limit: maxRows, offset: 0 };
        const { items, total } = await this.getList(exportQuery, currentUser);

        const now = new Date();
        const fileName = `audit-log-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.xlsx`;

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count, Content-Disposition');
        res.setHeader('X-Total-Count', String(Math.min(total, items.length)));

        const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
            stream: res,
            useStyles: true,
            useSharedStrings: false,
        });
        const ws = workbook.addWorksheet('Lịch sử tác động', {
            views: [{ state: 'frozen', ySplit: 1 }],
        });
        ws.columns = [
            { header: 'Thời gian', key: 'occurredAt', width: 22 },
            { header: 'Người thực hiện', key: 'performer', width: 28 },
            { header: 'Phòng', key: 'room', width: 22 },
            { header: 'Loại', key: 'category', width: 14 },
            { header: 'Hành động', key: 'title', width: 28 },
            { header: 'Mã phiếu GPB', key: 'serviceReqCode', width: 18 },
            { header: 'Mã HIS', key: 'hisCode', width: 18 },
            { header: 'Bệnh nhân', key: 'patientName', width: 26 },
            { header: 'Dịch vụ', key: 'serviceName', width: 32 },
        ];

        const headerRow = ws.getRow(1);
        headerRow.font = { bold: true };

        items.forEach((item, index) => {
            const row = ws.addRow({
                occurredAt: item.occurredAt
                    ? new Date(item.occurredAt).toLocaleString('vi-VN')
                    : '',
                performer: item.actionUserFullName || item.actionUsername || '',
                room: item.actionRoomName || '',
                category: item.eventCategory,
                title: item.eventTitle,
                serviceReqCode: item.serviceReqCode || '',
                hisCode: item.hisServiceReqCode || '',
                patientName: item.patientName || '',
                serviceName:
                    item.scope === AuditScope.TICKET && !item.serviceName
                        ? 'Cả phiếu'
                        : item.serviceName || '',
            });
            row.commit();
            if (index % 500 === 0) {
                // allow stream flush
            }
        });

        await ws.commit();
        await workbook.commit();
    }

    private async resolveRoomScope(
        roomId: string | undefined,
        currentUser: CurrentUser | null,
    ): Promise<{ roomId?: string; roomIds?: string[] }> {
        const normalizedRoomId = roomId?.trim() || undefined;
        if (normalizedRoomId) {
            return { roomId: normalizedRoomId };
        }
        if (!currentUser) {
            return { roomIds: [] };
        }
        const user = await this.userRepo.findById(currentUser.id);
        if (user?.role === 'admin') {
            return {};
        }
        const userRooms = await this.userRoomRepo.findActiveByUserId(currentUser.id);
        return { roomIds: userRooms.map((ur) => ur.roomId) };
    }
}
