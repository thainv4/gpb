export enum AuditEventCategory {
    WORKFLOW = 'WORKFLOW',
    RESULT = 'RESULT',
    SIGN = 'SIGN',
    DOCUMENT = 'DOCUMENT',
    TICKET = 'TICKET',
}

export enum AuditEventCode {
    TICKET_STORED = 'TICKET_STORED',
    TICKET_UPDATE = 'TICKET_UPDATE',
    TICKET_GPB_UPDATE = 'TICKET_GPB_UPDATE',
    WORKFLOW_START = 'WORKFLOW_START',
    WORKFLOW_TRANSITION = 'WORKFLOW_TRANSITION',
    WORKFLOW_UPDATE = 'WORKFLOW_UPDATE',
    WORKFLOW_DELETE = 'WORKFLOW_DELETE',
    RESULT_SAVE = 'RESULT_SAVE',
    SIGN_SET = 'SIGN_SET',
    SIGN_CLEAR = 'SIGN_CLEAR',
    DOCUMENT_STORED = 'DOCUMENT_STORED',
    PIVKA_SAVE = 'PIVKA_SAVE',
    SAMPLE_HANDOVER = 'SAMPLE_HANDOVER',
    HIS_UPDATE_RESULT = 'HIS_UPDATE_RESULT',
}

export enum AuditScope {
    TICKET = 'TICKET',
    SERVICE = 'SERVICE',
}

export const AUDIT_EVENT_TITLES: Record<AuditEventCode, string> = {
    [AuditEventCode.TICKET_STORED]: 'Lưu phiếu từ HIS',
    [AuditEventCode.TICKET_UPDATE]: 'Cập nhật thông tin phiếu',
    [AuditEventCode.TICKET_GPB_UPDATE]: 'Cập nhật trường GPB phiếu',
    [AuditEventCode.WORKFLOW_START]: 'Bắt đầu quy trình',
    [AuditEventCode.WORKFLOW_TRANSITION]: 'Chuyển bước quy trình',
    [AuditEventCode.WORKFLOW_UPDATE]: 'Cập nhật bước hiện tại',
    [AuditEventCode.WORKFLOW_DELETE]: 'Xóa bản ghi quy trình',
    [AuditEventCode.RESULT_SAVE]: 'Lưu kết quả xét nghiệm',
    [AuditEventCode.SIGN_SET]: 'Gán chữ ký số',
    [AuditEventCode.SIGN_CLEAR]: 'Hủy chữ ký số',
    [AuditEventCode.DOCUMENT_STORED]: 'Lưu PDF đã ký',
    [AuditEventCode.PIVKA_SAVE]: 'Lưu kết quả PIVKA',
    [AuditEventCode.SAMPLE_HANDOVER]: 'Xác nhận bàn giao mẫu',
    [AuditEventCode.HIS_UPDATE_RESULT]: 'Gửi kết quả HIS',
};

export function categoryForEventCode(code: AuditEventCode): AuditEventCategory {
    switch (code) {
        case AuditEventCode.TICKET_STORED:
        case AuditEventCode.TICKET_UPDATE:
        case AuditEventCode.TICKET_GPB_UPDATE:
        case AuditEventCode.SAMPLE_HANDOVER:
            return AuditEventCategory.TICKET;
        case AuditEventCode.WORKFLOW_START:
        case AuditEventCode.WORKFLOW_TRANSITION:
        case AuditEventCode.WORKFLOW_UPDATE:
        case AuditEventCode.WORKFLOW_DELETE:
            return AuditEventCategory.WORKFLOW;
        case AuditEventCode.RESULT_SAVE:
        case AuditEventCode.PIVKA_SAVE:
        case AuditEventCode.HIS_UPDATE_RESULT:
            return AuditEventCategory.RESULT;
        case AuditEventCode.SIGN_SET:
        case AuditEventCode.SIGN_CLEAR:
            return AuditEventCategory.SIGN;
        case AuditEventCode.DOCUMENT_STORED:
            return AuditEventCategory.DOCUMENT;
        default:
            return AuditEventCategory.TICKET;
    }
}
