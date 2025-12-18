# Danh Sách Files Cần Sửa Khi Thêm 16 Fields Kết Quả

## Tổng Quan: 7 Files Cần Sửa

---

## 1. Database Migration Script
**File**: `database/migrations/017_add_result_fields_to_stored_sr_services.sql` (mới tạo)

**Nội dung cần thêm**:
- ALTER TABLE để thêm 16 columns mới
- CREATE INDEX cho các fields quan trọng (RESULT_STATUS, QC_STATUS, etc.)
- COMMENTS cho các columns

**Fields cần thêm**:
```sql
ALTER TABLE BML_STORED_SR_SERVICES ADD (
    -- Result Value & Status (4 fields)
    RESULT_VALUE NUMBER(15,4),
    RESULT_VALUE_TEXT VARCHAR2(500),
    RESULT_STATUS VARCHAR2(20),
    IS_NORMAL NUMBER(1) DEFAULT 0,
    
    -- Result Timestamps (4 fields)
    RESULT_ENTERED_AT TIMESTAMP,
    RESULT_REVIEWED_AT TIMESTAMP,
    RESULT_APPROVED_AT TIMESTAMP,
    RESULT_COMPLETED_AT TIMESTAMP,
    
    -- Result Users (3 fields)
    RESULT_ENTERED_BY_USER_ID VARCHAR2(36),
    RESULT_REVIEWED_BY_USER_ID VARCHAR2(36),
    RESULT_APPROVED_BY_USER_ID VARCHAR2(36),
    
    -- Result Notes & Metadata (2 fields)
    RESULT_NOTES VARCHAR2(1000),
    RESULT_METADATA CLOB,
    
    -- Quality Control (3 fields)
    QC_STATUS VARCHAR2(20),
    QC_CHECKED_BY_USER_ID VARCHAR2(36),
    QC_CHECKED_AT TIMESTAMP
);
```

---

## 2. Entity: StoredServiceRequestService
**File**: `src/modules/service-request/entities/stored-service-request-service.entity.ts`

**Nội dung cần sửa**:
- Thêm 16 properties với @Column decorators
- Thêm indexes cho các fields quan trọng (nếu cần)

**Vị trí**: Sau field `resultText` (dòng 68-69)

---

## 3. Response DTO: StoredServiceResponseDto
**File**: `src/modules/service-request/dto/responses/stored-service-request-detail-response.dto.ts`

**Nội dung cần sửa**:
- Thêm 16 properties vào class `StoredServiceResponseDto`
- Thêm @ApiProperty decorators cho Swagger documentation

**Vị trí**: Trong class `StoredServiceResponseDto` (sau field `resultText`)

---

## 4. Service: Mapping Logic
**File**: `src/modules/service-request/services/stored-service-request.service.ts`

**Nội dung cần sửa**:
- Method `mapServiceToDto()` - thêm mapping cho 16 fields mới
- Cập nhật logic mapping trong `getStoredServiceRequestById()`

**Vị trí**: 
- Method `mapServiceToDto()` (dòng ~386-416)
- Cần thêm mapping cho tất cả 16 fields

---

## 5. Command DTO (Nếu cần API nhập kết quả)
**File**: `src/modules/service-request/dto/commands/enter-result.dto.ts` (mới tạo - nếu cần)

**Nội dung**:
- DTO cho API nhập kết quả xét nghiệm
- Validation cho các fields kết quả

**Note**: Có thể tạo sau, không bắt buộc ngay

---

## 6. Update Result DTO (Nếu cần API update kết quả)
**File**: `src/modules/service-request/dto/commands/update-result.dto.ts` (mới tạo - nếu cần)

**Nội dung**:
- DTO cho API update kết quả
- Validation cho các fields có thể update

**Note**: Có thể tạo sau, không bắt buộc ngay

---

## 7. Indexes (Optional - nếu cần query performance)
**File**: `database/migrations/017_add_result_fields_to_stored_sr_services.sql`

**Nội dung cần thêm**:
```sql
-- Indexes cho result fields
CREATE INDEX IDX_SSR_SERV_RES_STAT ON BML_STORED_SR_SERVICES(RESULT_STATUS);
CREATE INDEX IDX_SSR_SERV_QC_STAT ON BML_STORED_SR_SERVICES(QC_STATUS);
CREATE INDEX IDX_SSR_SERV_RES_ENT_AT ON BML_STORED_SR_SERVICES(RESULT_ENTERED_AT);
CREATE INDEX IDX_SSR_SERV_RES_APP_AT ON BML_STORED_SR_SERVICES(RESULT_APPROVED_AT);
```

---

## Tóm Tắt Files Cần Sửa:

### Bắt Buộc (4 files):
1. ✅ **Migration Script** (mới) - `017_add_result_fields_to_stored_sr_services.sql`
2. ✅ **Entity** - `stored-service-request-service.entity.ts`
3. ✅ **Response DTO** - `stored-service-request-detail-response.dto.ts`
4. ✅ **Service** - `stored-service-request.service.ts` (method `mapServiceToDto`)

### Tùy Chọn (3 files - tạo sau nếu cần):
5. 🔸 **Command DTO** - `enter-result.dto.ts` (nếu có API nhập kết quả)
6. 🔸 **Update DTO** - `update-result.dto.ts` (nếu có API update kết quả)
7. 🔸 **Indexes** - Trong migration script (nếu cần query performance)

---

## Thứ Tự Thực Hiện:

1. **Migration Script** → Tạo và chạy migration
2. **Entity** → Thêm properties
3. **Response DTO** → Thêm fields
4. **Service** → Cập nhật mapping
5. **Build & Test** → Kiểm tra lỗi

