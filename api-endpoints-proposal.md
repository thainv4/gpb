# Đề Xuất: API Endpoints Cho Quản Lý Kết Quả Xét Nghiệm

## Tổng Quan: 4 API Endpoints Cần Thêm

---

## 1. PUT `/api/v1/service-requests/stored/:storedReqId/services/:serviceId/result`
**Mục đích**: Nhập/cập nhật kết quả xét nghiệm

**Request Body**:
```json
{
  "resultValue": 12.5,
  "resultValueText": "12.5",
  "resultText": "Kết quả chi tiết...",
  "resultStatus": "NORMAL",
  "resultNotes": "Ghi chú về kết quả",
  "resultMetadata": "{\"machine\": \"XYZ-123\", \"method\": \"Automated\"}"
}
```

**Response**:
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "id": "service-id",
    "resultEnteredAt": "2025-11-03T10:30:00Z",
    "resultEnteredByUserId": "user-id"
  }
}
```

**Logic**:
- Set `RESULT_ENTERED_AT` = now
- Set `RESULT_ENTERED_BY_USER_ID` = currentUser.id
- Validate `resultStatus` (NORMAL/ABNORMAL/CRITICAL)
- Auto-calculate `IS_NORMAL` từ `resultStatus` và `rangeLow/rangeHigh`

---

## 2. POST `/api/v1/service-requests/stored/:storedReqId/services/:serviceId/result/review`
**Mục đích**: Review kết quả (người review)

**Request Body**:
```json
{
  "notes": "Ghi chú review",
  "approved": true
}
```

**Response**:
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "id": "service-id",
    "resultReviewedAt": "2025-11-03T11:00:00Z",
    "resultReviewedByUserId": "reviewer-id"
  }
}
```

**Logic**:
- Set `RESULT_REVIEWED_AT` = now
- Set `RESULT_REVIEWED_BY_USER_ID` = currentUser.id
- Nếu `approved = false` → có thể reject và yêu cầu nhập lại

---

## 3. POST `/api/v1/service-requests/stored/:storedReqId/services/:serviceId/result/approve`
**Mục đích**: Phê duyệt kết quả (người phê duyệt)

**Request Body**:
```json
{
  "notes": "Ghi chú phê duyệt"
}
```

**Response**:
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "id": "service-id",
    "resultApprovedAt": "2025-11-03T11:30:00Z",
    "resultApprovedByUserId": "approver-id"
  }
}
```

**Logic**:
- Set `RESULT_APPROVED_AT` = now
- Set `RESULT_APPROVED_BY_USER_ID` = currentUser.id
- Kết quả đã được phê duyệt, có thể gửi về HIS

---

## 4. POST `/api/v1/service-requests/stored/:storedReqId/services/:serviceId/result/qc`
**Mục đích**: Kiểm tra Quality Control

**Request Body**:
```json
{
  "qcStatus": "PASSED",
  "notes": "QC passed"
}
```

**Response**:
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "id": "service-id",
    "qcStatus": "PASSED",
    "qcCheckedAt": "2025-11-03T12:00:00Z",
    "qcCheckedByUserId": "qc-user-id"
  }
}
```

**Logic**:
- Set `QC_STATUS` = PASSED/FAILED/PENDING
- Set `QC_CHECKED_AT` = now
- Set `QC_CHECKED_BY_USER_ID` = currentUser.id

---

## Files Cần Tạo Mới:

### 1. DTOs (4 files):
- `src/modules/service-request/dto/commands/enter-result.dto.ts`
- `src/modules/service-request/dto/commands/review-result.dto.ts`
- `src/modules/service-request/dto/commands/approve-result.dto.ts`
- `src/modules/service-request/dto/commands/qc-result.dto.ts`

### 2. Service Methods (1 file - sửa):
- `src/modules/service-request/services/stored-service-request.service.ts`
  - `enterResult()` method
  - `reviewResult()` method
  - `approveResult()` method
  - `qcResult()` method

### 3. Controller (1 file - sửa):
- `src/modules/service-request/controllers/service-request.controller.ts`
  - Thêm 4 endpoints mới

### 4. Repository Interface & Implementation (nếu cần):
- Có thể cần thêm method `findServiceById()` trong repository

---

## Workflow Kết Quả:

```
1. Nhập kết quả (Enter Result)
   ↓
2. Review kết quả (Review Result)
   ↓
3. Kiểm tra QC (QC Check) - có thể làm song song với Review
   ↓
4. Phê duyệt kết quả (Approve Result)
   ↓
5. Gửi về HIS (nếu cần)
```

---

## Tóm Tắt:

**Cần tạo mới**: 4 DTOs + 4 Service methods + 4 Controller endpoints
**Tổng cộng**: ~12 files/methods cần tạo/sửa

**Option đơn giản hơn**: 
- Chỉ tạo 1 API `PUT /result` để update tất cả fields kết quả
- Hoặc tách thành 2 APIs: Enter Result + Approve Result

