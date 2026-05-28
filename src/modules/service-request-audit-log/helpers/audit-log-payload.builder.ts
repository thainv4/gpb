import { StoredServiceRequest } from '../../service-request/entities/stored-service-request.entity';
import { StoredServiceRequestService } from '../../service-request/entities/stored-service-request-service.entity';

export type AuditPayloadEnvelope = Record<string, unknown> & {
    snapshot: Record<string, unknown>;
    meta?: Record<string, unknown>;
}

export function buildResultSaveSnapshot(
    service: StoredServiceRequestService,
    storedRequest: StoredServiceRequest,
): AuditPayloadEnvelope {
    return {
        snapshot: {
            storedServiceId: service.id,
            serviceName: service.serviceName ?? null,
            serviceCode: service.serviceCode ?? null,
            resultStatus: service.resultStatus ?? null,
            resultValue: service.resultValue ?? null,
            resultValueText: service.resultValueText ?? null,
            resultText: service.resultText ?? null,
            resultName: service.resultName ?? null,
            resultMetadata: service.resultMetadata ?? null,
            description: service.description ?? null,
            conclude: service.conclude ?? null,
            note: service.note ?? null,
            notes: service.notes ?? null,
            resultComment: service.resultComment ?? null,
            resultRecomment: service.resultRecomment ?? null,
            testingMethodGenId: service.testingMethodGenId ?? null,
            isNormal: service.isNormal ?? null,
            flag: storedRequest.flag ?? null,
            numOfBlock: storedRequest.numOfBlock ?? null,
        },
    };
}

export function buildTicketUpdateSnapshot(
    storedRequest: StoredServiceRequest,
    updatedFields: string[],
): AuditPayloadEnvelope {
    const snapshot: Record<string, unknown> = { updatedFields };
    if (updatedFields.includes('flag')) snapshot.flag = storedRequest.flag ?? null;
    if (updatedFields.includes('stainingMethodId')) {
        snapshot.stainingMethodId = storedRequest.stainingMethodId ?? null;
    }
    if (updatedFields.includes('testingMethodGenId')) {
        snapshot.testingMethodGenId = storedRequest.testingMethodGenId ?? null;
    }
    if (updatedFields.includes('numOfBlock')) snapshot.numOfBlock = storedRequest.numOfBlock ?? null;
    return { snapshot };
}

export function buildGpbFieldsSnapshot(storedRequest: StoredServiceRequest): AuditPayloadEnvelope {
    return {
        snapshot: {
            barcodeGenGpb: storedRequest.barcodeGenGpb ?? null,
            resultConcludeGenGpb: storedRequest.resultConcludeGenGpb ?? null,
            sampleTypeNameGenGpb: storedRequest.sampleTypeNameGenGpb ?? null,
        },
    };
}

export function buildWorkflowTransitionSnapshot(input: {
    fromStateName: string | null;
    toStateName: string;
    fromStateOrder?: number | null;
    toStateOrder?: number | null;
    actionType: string;
    durationMinutes?: number | null;
    workflowHistoryId: string;
    notes?: string | null;
}): AuditPayloadEnvelope {
    return {
        snapshot: {
            fromStateName: input.fromStateName,
            toStateName: input.toStateName,
            fromStateOrder: input.fromStateOrder ?? null,
            toStateOrder: input.toStateOrder ?? null,
            actionType: input.actionType,
            durationMinutes: input.durationMinutes ?? null,
            workflowHistoryId: input.workflowHistoryId,
            notes: input.notes ?? null,
        },
    };
}

export function buildWorkflowDeleteSnapshot(input: {
    workflowHistoryId: string;
    toStateName: string;
    toStateCode?: string | null;
    stateOrder?: number | null;
    fromStateName?: string | null;
    actionType?: string | null;
    trigger?: string | null;
    relatedDocumentId?: number | string | null;
}): AuditPayloadEnvelope {
    return {
        snapshot: {
            workflowHistoryId: input.workflowHistoryId,
            toStateName: input.toStateName,
            toStateCode: input.toStateCode ?? null,
            stateOrder: input.stateOrder ?? null,
            fromStateName: input.fromStateName ?? null,
            actionType: input.actionType ?? null,
            trigger: input.trigger ?? null,
            relatedDocumentId: input.relatedDocumentId ?? null,
        },
    };
}

export function buildSignSnapshot(input: {
    documentId?: number | string | null;
    previousDocumentId?: number | string | null;
    serviceName?: string | null;
}): AuditPayloadEnvelope {
    return { snapshot: { ...input } };
}

export function buildSampleHandoverSnapshot(input: {
    storedRequest: StoredServiceRequest;
    handoverNote?: string | null;
    receiverRoomId?: string | null;
    receiverRoomName?: string | null;
    receiverDepartmentId?: string | null;
    stainingMethodId?: string | null;
    stainingMethodName?: string | null;
    workflow: {
        fromStateName: string | null;
        toStateName: string;
        actionType: string;
        durationMinutes?: number | null;
        notes?: string | null;
    };
    services: Array<{ id: string; serviceName?: string | null; serviceCode?: string | null }>;
}): AuditPayloadEnvelope {
    return {
        snapshot: {
            flag: input.storedRequest.flag ?? null,
            numOfBlock: input.storedRequest.numOfBlock ?? null,
            stainingMethodId: input.storedRequest.stainingMethodId ?? null,
            stainingMethodName: input.stainingMethodName ?? null,
            barcodeGenGpb: input.storedRequest.barcodeGenGpb ?? null,
            resultConcludeGenGpb: input.storedRequest.resultConcludeGenGpb ?? null,
            sampleTypeNameGenGpb: input.storedRequest.sampleTypeNameGenGpb ?? null,
            handoverNote: input.handoverNote ?? null,
            receiverRoomId: input.receiverRoomId ?? null,
            receiverRoomName: input.receiverRoomName ?? null,
            receiverDepartmentId: input.receiverDepartmentId ?? null,
            fromStateName: input.workflow.fromStateName,
            toStateName: input.workflow.toStateName,
            actionType: input.workflow.actionType,
            durationMinutes: input.workflow.durationMinutes ?? null,
            workflowNotes: input.workflow.notes ?? null,
            serviceCount: input.services.length,
            services: input.services,
        },
    };
}

export function buildHisUpdateSnapshot(input: {
    success: boolean;
    httpStatus?: number | null;
    tdlServiceReqCode?: string | null;
    tdlServiceCode?: string | null;
    description?: string | null;
    conclude?: string | null;
    note?: string | null;
    errorMessage?: string | null;
}): AuditPayloadEnvelope {
    return { snapshot: { ...input } };
}

export function buildPivkaSnapshot(fields: Record<string, unknown>): AuditPayloadEnvelope {
    return { snapshot: fields };
}

export function buildTicketStoredSnapshot(
    servicesCount: number,
    hisServiceReqCode?: string | null,
): AuditPayloadEnvelope {
    return {
        snapshot: {
            source: 'HIS',
            servicesCount,
            hisServiceReqCode: hisServiceReqCode ?? null,
        },
    };
}
