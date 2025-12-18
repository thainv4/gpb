# Đề Xuất: Bổ Sung Fields Kết Quả Xét Nghiệm

## Entity: `StoredServiceRequestService` (BML_STORED_SR_SERVICES)

### Lý do:
- Entity này đã lưu thông tin từng service/test (cả parent và child)
- Đã có `RESULT_TEXT` (CLOB) cho kết quả dạng text
- Cần bổ sung metadata và workflow của kết quả

## Fields Đề Xuất:

### 1. Result Value & Status
```sql
RESULT_VALUE NUMBER(15,4),              -- Giá trị kết quả (số)
RESULT_VALUE_TEXT VARCHAR2(500),        -- Giá trị kết quả (text/non-numeric)
RESULT_STATUS VARCHAR2(20),             -- Trạng thái: NORMAL, ABNORMAL, CRITICAL, PENDING
IS_NORMAL NUMBER(1) DEFAULT 0,         -- 1 = bình thường, 0 = bất thường
```

### 2. Result Timestamps
```sql
RESULT_ENTERED_AT TIMESTAMP,           -- Thời gian nhập kết quả
RESULT_REVIEWED_AT TIMESTAMP,          -- Thời gian review
RESULT_APPROVED_AT TIMESTAMP,          -- Thời gian phê duyệt
RESULT_COMPLETED_AT TIMESTAMP,          -- Thời gian hoàn thành (tất cả tests)
```

### 3. Result Users (Audit)
```sql
RESULT_ENTERED_BY_USER_ID VARCHAR2(36), -- User nhập kết quả
RESULT_REVIEWED_BY_USER_ID VARCHAR2(36),-- User review
RESULT_APPROVED_BY_USER_ID VARCHAR2(36),-- User phê duyệt
```

### 4. Result Notes & Metadata
```sql
RESULT_NOTES VARCHAR2(1000),           -- Ghi chú về kết quả
RESULT_METADATA CLOB,                  -- JSON metadata (máy xét nghiệm, method, etc.)
```

### 5. Quality Control
```sql
QC_STATUS VARCHAR2(20),                -- QC status: PASSED, FAILED, PENDING
QC_CHECKED_BY_USER_ID VARCHAR2(36),    -- User kiểm tra QC
QC_CHECKED_AT TIMESTAMP,               -- Thời gian kiểm tra QC
```

## Workflow States:
- **PENDING**: Chưa có kết quả
- **ENTERED**: Đã nhập kết quả (chờ review)
- **REVIEWED**: Đã review (chờ phê duyệt)
- **APPROVED**: Đã phê duyệt
- **REJECTED**: Từ chối (cần nhập lại)

## Trạng Thái Kết Quả:
- **NORMAL**: Bình thường
- **ABNORMAL**: Bất thường
- **CRITICAL**: Nghiêm trọng (cần xử lý ngay)
- **PENDING**: Đang chờ

## Tóm Tắt:
- **Đã có**: `RESULT_TEXT` (CLOB) - kết quả dạng text
- **Cần thêm**: Result value, status, timestamps, users, notes, QC

