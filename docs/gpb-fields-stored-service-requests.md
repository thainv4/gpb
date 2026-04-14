# GPB fields on `BML_STORED_SERVICE_REQUESTS` — implementation notes

This document summarizes decisions and changes from the GPB header work: moving the source of truth for three GPB values to the stored service request table, API contract renames, frontend updates, and removal of data-copy migrations.

---

## 1. Business goals

- Store and read **three GPB fields** on the **header** table `BML_STORED_SERVICE_REQUESTS`:
  - `BARCODE_GEN_GPB`
  - `RESULT_CONCLUDE_GEN_GPB`
  - `SAMPLE_TYPE_NAME_GEN_GPB`
- The older “map” counterparts still exist on `BML_STORED_SR_SERVICES` as: `BARCODE_MAP_GEN_GPB`, `RESULT_CONCLUDE_MAP_GEN_GPB`, `SAMPLE_TYPE_NAME_MAP_GEN_GPB`.
- **Final decision:** `PATCH gpb-fields` updates **only** the header table. GET responses expose **only** the `*GenGpb` JSON fields (no parallel `*MapGenGpb` in the public DTO).

---

## 2. Backend (NestJS / TypeORM)

### 2.1. Entity

- File: `src/modules/service-request/entities/stored-service-request.entity.ts`
- Columns mapped:
  - `BARCODE_GEN_GPB` → `barcodeGenGpb`
  - `RESULT_CONCLUDE_GEN_GPB` → `resultConcludeGenGpb`
  - `SAMPLE_TYPE_NAME_GEN_GPB` → `sampleTypeNameGenGpb`

The child table entity may still define `*_MAP_GEN_GPB` for the physical schema; the **stored service** response DTO no longer exposes those map fields.

### 2.2. PATCH `gpb-fields`

- Route: `PATCH /api/v1/service-requests/stored/:storedServiceReqId/gpb-fields`
- Controller: `src/modules/service-request/controllers/service-request.controller.ts`
- DTO: `src/modules/service-request/dto/commands/update-gpb-fields.dto.ts`  
  Partial body: `barcodeGenGpb`, `resultConcludeGenGpb`, `sampleTypeNameGenGpb`
- Service: `StoredServiceRequestService.updateGpbFields` in `stored-service-request.service.ts`
  - Inside a transaction: `manager.findOne(StoredServiceRequest, …)` → assign fields → `manager.save(StoredServiceRequest, …)`
  - **Only** writes `BML_STORED_SERVICE_REQUESTS`; does **not** bulk-update `BML_STORED_SR_SERVICES`.

### 2.3. Sync after storing a new request

- After inserting parent/child rows in `storeServiceRequest`, `syncGpbGenFieldsToStoredRequestHeader` runs.
- It `UPDATE`s the header from `MAX` of `*_MAP_GEN_GPB` on **parent** services (`IS_CHILD_SERVICE = 0`, with `DELETED_AT IS NULL` in the current implementation).
- Purpose: keep header aligned with map columns on services when those columns are still populated (until you fully rely on PATCH header only).

### 2.4. GET stored service by id

- Route: `GET /api/v1/service-requests/stored/services/:serviceId`
- DTO: `StoredServiceResponseDto` in `stored-service-request-detail-response.dto.ts`
  - Includes: `barcodeGenGpb`, `resultConcludeGenGpb`, `sampleTypeNameGenGpb`
  - Removed from JSON: `barcodeMapGenGpb`, etc.
- `mapServiceToDto` takes optional `gpbHeader` (from the parent `StoredServiceRequest` when building the full stored request) or falls back to `service.storedServiceRequest`; passes the same header into nested `serviceTests`.

### 2.5. GET stored request detail (by stored request id)

- `StoredServiceRequestDetailResponseDto` includes the same three fields at the **root**, mapped from the `StoredServiceRequest` entity.

### 2.6. Migrations (history / cleanup)

- Kept in repo (schema on services): `src/migrations/1740000001100-AddSampleTypeNameMapGenGpbToBmlStoredSrServices.ts` — adds `SAMPLE_TYPE_NAME_MAP_GEN_GPB` on `BML_STORED_SR_SERVICES`.
- **Removed from source:** migrations whose only role was **ADD header columns + copy or refresh data** from services (`MoveGpbMapFieldsToBmlStoredServiceRequests`, `RefreshGpbGenFieldsOnBmlStoredServiceRequests`).
- **Note for new environments:** ensure the three `*_GEN_GPB` columns exist on `BML_STORED_SERVICE_REQUESTS` (manual DDL or a small `ADD COLUMN` migration). The deleted “move” migration used to create them.

---

## 3. Frontend (`fe-gpb`)

### 3.1. API client

- File: `src/lib/api/client.ts`
- Types `StoredService` / `StoredServiceRequestResponse`: use `barcodeGenGpb`, `resultConcludeGenGpb`, `sampleTypeNameGenGpb`.
- `updateStoredServiceRequestGpbFields` sends the new keys in the JSON body.

### 3.2. Sample delivery page

- File: `src/components/sample-delivery/sample-delivery-table.tsx`
- Local state, tab persistence, and the post-workflow `PATCH gpb-fields` call use the new field names.

### 3.3. Form gen-1

- File: `src/components/test-results/form-export-pdf/form-gen-1.tsx`
- Reads `barcodeGenGpb` from `specificService` or root `data` / `services[0]`.
- Prefers `sampleTypeNameGenGpb` and `resultConcludeGenGpb` from the header-backed payload; may still fall back to the `result-conclude` API by barcode when needed.

---

## 4. Verification

- Run `npm run type-check` in both `gpb` and `fe-gpb`.
- After `PATCH gpb-fields`, confirm the three columns on `BML_STORED_SERVICE_REQUESTS`.
- `GET /api/v1/service-requests/stored/services/{serviceId}` should return the three `*GenGpb` fields.

---

## 5. Related docs

- `docs/workflow-integration-with-save-service-request.md`

---

*Update this file if schema or API changes again.*
