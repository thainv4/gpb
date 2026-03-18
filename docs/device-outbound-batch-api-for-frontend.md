## Batch Create Device Outbound – Mô tả cho Frontend

Giải pháp 2 bổ sung một API **tạo nhiều bản ghi Device Outbound trong một lần gọi** (batch). Mục tiêu:

- User nhập tuần tự: **Dịch vụ → Block → Slide → Phương pháp**, nhấn “Thêm Slide” để build danh sách nhiều dòng.
- Khi nhấn **Gửi**, FE gửi **một request duy nhất** để tạo toàn bộ dòng (atomic).

> Lưu ý: Phần này mô tả **API mong muốn** cho FE; backend cần implement tương ứng (route, DTO, transaction).

---

### 1. Endpoint

| Mục | Giá trị |
|-----|---------|
| **Method** | `POST` |
| **URL** | `/api/v1/device-outbound/batch` |
| **Auth** | Bearer JWT bắt buộc (như các API device-outbound khác) |

---

### 2. Request body

```json
{
  "receptionCode": "S2601.0312",
  "serviceCode": "BM125",
  "items": [
    { "blockNumber": 1, "slideNumber": 1, "method": "HE" },
    { "blockNumber": 2, "slideNumber": 1, "method": "HE" },
    { "blockNumber": 2, "slideNumber": 2, "method": "PAS" },
    { "blockNumber": 2, "slideNumber": 3, "method": "CL" },
    { "blockNumber": 3, "slideNumber": 1, "method": "HE" }
  ]
}
```

**Quy tắc field:**

| Field | Kiểu | Bắt buộc | Ràng buộc | Mô tả |
|-------|------|----------|-----------|--------|
| `receptionCode` | string | Có | max 50 | Mã tiếp nhận mẫu (barcode gốc) |
| `serviceCode` | string | Có | max 50 | Mã dịch vụ áp dụng cho **tất cả** các dòng trong batch |
| `items` | `Array` | Có | không rỗng | Danh sách dòng cần tạo |
| `items[].blockNumber` | number | Có | ≥ 1 | Số block (1, 2, 3, …) |
| `items[].slideNumber` | number | Có | ≥ 1 | Số slide trong block |
| `items[].method` | string | Có | max 50 | Phương pháp (PP: HE, PAS, CL, …) |

**Block_ID / Slide_ID backend tự tính:**

- `blockId = receptionCode + "A." + blockNumber`
- `slideId = receptionCode + "A." + blockNumber + "." + slideNumber`

FE **không** cần gửi `blockId` / `slideId`, chỉ cần `blockNumber` và `slideNumber`. FE vẫn có thể hiển thị block/slide theo cùng công thức để user nhìn giống backend.

---

### 3. Response

**Response 201 – `data`:** Danh sách các bản ghi đã tạo.

```json
{
  "success": true,
  "status_code": 201,
  "data": [
    {
      "id": "uuid-1",
      "receptionCode": "S2601.0312",
      "serviceCode": "BM125",
      "blockId": "S2601.0312A.1",
      "slideId": "S2601.0312A.1.1",
      "method": "HE",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "uuid-2",
      "receptionCode": "S2601.0312",
      "serviceCode": "BM125",
      "blockId": "S2601.0312A.2",
      "slideId": "S2601.0312A.2.1",
      "method": "HE",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
    // ... các dòng còn lại
  ],
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**Kiểu phần tử trong `data[]`** giống `DeviceOutboundItem` đã mô tả trong `device-outbound-api-for-frontend.md`.

---

### 4. Trường hợp lỗi

**Validation lỗi (400):**

- Thiếu `receptionCode`, `serviceCode` hoặc `items` rỗng.
- Một trong các item thiếu `blockNumber`, `slideNumber`, `method` hoặc giá trị không hợp lệ (blockNumber/slideNumber < 1, method quá dài, …).
- Không có JWT (chỉ gửi HIS token).

Ví dụ:

```json
{
  "success": false,
  "status_code": 400,
  "error": {
    "code": "VAL_001",
    "message": "Invalid batch payload",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "trace_id": "trace-123",
    "details": {
      "items[2].blockNumber": "must be greater than or equal to 1"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "trace_id": "trace-123"
  }
}
```

**Lỗi hệ thống (500):**

- Backend gặp lỗi khi insert DB, transaction rollback toàn bộ.  
- FE chỉ cần hiển thị thông báo lỗi chung, cho phép user thử lại.

---

### 5. Cách sử dụng trên Frontend

Giả sử màn hình có 4 dropdown như mockup:

1. **Chọn dịch vụ**  
   - Gọi `GET /api/v1/device-outbound/services?receptionCode=...` để lấy danh sách dịch vụ theo `receptionCode`.  
   - Khi user chọn 1 dịch vụ, lưu `serviceCode` (hoặc id, tùy backend) vào state chung.

2. **Chọn Block**  
   - FE cho phép chọn `blockNumber` (vd: 1, 2, 3, …). Có thể là dropdown số hoặc input stepper.

3. **Chọn Slide**  
   - FE cho phép chọn `slideNumber` (1, 2, 3, …).  
   - FE có thể render `Block_ID` = `receptionCode + \"A.\" + blockNumber` và `Slide_ID` = `receptionCode + \"A.\" + blockNumber + \".\" + slideNumber` để hiển thị đúng như bảng mẫu.

4. **Chọn PP (Phương pháp)**  
   - Dropdown cố định (vd: `['HE','PAS','CL',...]`) hoặc load từ API cấu hình khác nếu có.

5. **Nút “Thêm Slide”**  
   - Khi nhấn, FE **không gọi API**; chỉ push vào state local:
     ```ts
     items.push({ blockNumber, slideNumber, method });
     ```
   - Hiển thị bảng với cột:
     - Block_ID (render client-side),
     - Slide_ID (render client-side),
     - PP (method),
     - nút xóa dòng (để user remove khỏi batch trước khi gửi).

6. **Nút “Gửi”**  
   - FE gọi:
     ```http
     POST /api/v1/device-outbound/batch
     Authorization: Bearer <JWT>
     Content-Type: application/json
     ```
   - Body:
     ```json
     {
       "receptionCode": "<reception-code-from-context>",
       "serviceCode": "<selected-service-code>",
       "items": [ ...các dòng trong bảng... ]
     }
     ```
   - Nếu thành công: backend trả list bản ghi đã tạo; FE có thể:
     - Clear form + bảng,
     - Hoặc merge vào danh sách device-outbound tổng.

7. **Nút “Cập nhật” (nếu có)**  
   - Nếu yêu cầu “ghi đè toàn bộ” danh sách cho `receptionCode + serviceCode`, có thể thống nhất contract riêng (vd: backend xóa hết bản ghi cũ rồi insert lại từ batch).  
   - FE vẫn có thể dùng **cùng body** như khi “Gửi”, nhưng cần confirm với backend về semantics (replace vs append).

---

### 6. Gợi ý type cho FE

```typescript
interface DeviceOutboundBatchItem {
  blockNumber: number;
  slideNumber: number;
  method: string;
}

interface DeviceOutboundBatchBody {
  receptionCode: string;
  serviceCode: string;
  items: DeviceOutboundBatchItem[];
}
```

Khi nhận response:

```typescript
type DeviceOutboundBatchResponse = ApiResponse<DeviceOutboundItem[]>;
```

